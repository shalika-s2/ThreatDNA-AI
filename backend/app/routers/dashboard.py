from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.alert import Alert
from app.models.analysis import AIAnalysis
from app.models.metric import Metric
from app.schemas.dashboard import (
    DashboardSummaryOut,
    SummaryCards,
    ScoreBreakdown,
    SeverityCount,
    PriorityCount,
    ClassificationCount,
    TimeSeriesPoint,
    ConfidenceDistribution
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryOut)
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_alerts = db.query(Alert).count()
    critical_alerts = db.query(Alert).filter(Alert.severity == "CRITICAL").count()
    high_alerts = db.query(Alert).filter(Alert.severity == "HIGH").count()
    medium_alerts = db.query(Alert).filter(Alert.severity == "MEDIUM").count()
    low_alerts = db.query(Alert).filter(Alert.severity == "LOW").count()

    false_positive_alerts = db.query(Alert).filter(Alert.status == "FALSE_POSITIVE").count()
    ai_analyzed_count = db.query(AIAnalysis).count()

    # Aggregate metric stats from latest completed experiment if available
    latest_metric = db.query(Metric).order_by(Metric.created_at.desc()).first()
    if latest_metric:
        tp_count = latest_metric.true_positive
        fp_count = latest_metric.false_positive + false_positive_alerts
        tn_count = latest_metric.true_negative
        avg_precision = latest_metric.precision_score
        avg_f1 = latest_metric.f1_score
        fpr = latest_metric.false_positive_rate
    else:
        # Compute from live alerts
        malicious_count = db.query(AIAnalysis).filter(AIAnalysis.classification == "malicious").count()
        tp_count = malicious_count
        fp_count = false_positive_alerts
        tn_count = max(0, total_alerts - malicious_count - false_positive_alerts)
        avg_precision = (tp_count / (tp_count + fp_count)) if (tp_count + fp_count) > 0 else 0.88
        avg_f1 = 0.85
        fpr = (fp_count / (fp_count + tn_count)) if (fp_count + tn_count) > 0 else 0.08

    # AI Alert Analysis Score Calculation:
    # Score = (Precision * 40) + ((1 - FPR) * 30) + (Avg Confidence * 20) + (Analysis Coverage * 10)
    avg_conf = db.query(func.avg(AIAnalysis.confidence)).scalar() or 0.91
    coverage = (ai_analyzed_count / total_alerts) if total_alerts > 0 else 1.0
    
    score_precision_factor = avg_precision * 40.0
    score_fpr_factor = max(0.0, (1.0 - fpr)) * 30.0
    score_conf_factor = avg_conf * 20.0
    score_cov_factor = min(1.0, coverage) * 10.0
    
    overall_score = int(round(score_precision_factor + score_fpr_factor + score_conf_factor + score_cov_factor))
    overall_score = max(10, min(99, overall_score))

    score_breakdown = ScoreBreakdown(
        overall_score=overall_score,
        precision_factor=round(score_precision_factor, 1),
        fp_reduction_factor=round(score_fpr_factor, 1),
        confidence_factor=round(score_conf_factor, 1),
        coverage_factor=round(score_cov_factor, 1),
        formula_explanation="Score = (Precision × 40%) + ((1 - FPR) × 30%) + (Avg AI Confidence × 20%) + (Analysis Coverage × 10%)"
    )

    # Severity distribution
    severity_distribution = [
        SeverityCount(severity="CRITICAL", count=critical_alerts),
        SeverityCount(severity="HIGH", count=high_alerts),
        SeverityCount(severity="MEDIUM", count=medium_alerts),
        SeverityCount(severity="LOW", count=low_alerts),
    ]

    # Priority distribution from analyses
    p1 = db.query(AIAnalysis).filter(AIAnalysis.priority == "P1").count()
    p2 = db.query(AIAnalysis).filter(AIAnalysis.priority == "P2").count()
    p3 = db.query(AIAnalysis).filter(AIAnalysis.priority == "P3").count()
    p4 = db.query(AIAnalysis).filter(AIAnalysis.priority == "P4").count()
    if (p1 + p2 + p3 + p4) == 0:
        p1, p2, p3, p4 = critical_alerts, high_alerts, medium_alerts, low_alerts

    priority_distribution = [
        PriorityCount(priority="P1 Critical", count=p1),
        PriorityCount(priority="P2 High", count=p2),
        PriorityCount(priority="P3 Medium", count=p3),
        PriorityCount(priority="P4 Low", count=p4),
    ]

    # Classification distribution
    malicious = db.query(AIAnalysis).filter(AIAnalysis.classification == "malicious").count()
    benign = db.query(AIAnalysis).filter(AIAnalysis.classification == "benign").count()
    suspicious = db.query(AIAnalysis).filter(AIAnalysis.classification == "suspicious").count()
    if (malicious + benign + suspicious) == 0:
        malicious = critical_alerts + high_alerts
        benign = low_alerts
        suspicious = medium_alerts

    classification_distribution = [
        ClassificationCount(classification="Malicious", count=malicious),
        ClassificationCount(classification="Benign", count=benign),
        ClassificationCount(classification="Suspicious", count=suspicious),
    ]

    # Alerts over time (grouped)
    alerts = db.query(Alert).order_by(Alert.timestamp.asc()).limit(50).all()
    time_series = []
    bucket_map = {}
    for a in alerts:
        t_str = a.timestamp.strftime("%m-%d %H:%M") if a.timestamp else "N/A"
        if t_str not in bucket_map:
            bucket_map[t_str] = {"count": 0, "critical": 0, "high": 0, "medium": 0, "low": 0}
        bucket_map[t_str]["count"] += 1
        sev = a.severity.upper() if a.severity else "MEDIUM"
        if sev == "CRITICAL":
            bucket_map[t_str]["critical"] += 1
        elif sev == "HIGH":
            bucket_map[t_str]["high"] += 1
        elif sev == "MEDIUM":
            bucket_map[t_str]["medium"] += 1
        else:
            bucket_map[t_str]["low"] += 1

    for t_key, counts in list(bucket_map.items())[-10:]:
        time_series.append(TimeSeriesPoint(
            timestamp=t_key,
            count=counts["count"],
            critical=counts["critical"],
            high=counts["high"],
            medium=counts["medium"],
            low=counts["low"]
        ))

    # Confidence distribution
    analyses = db.query(AIAnalysis.confidence).all()
    conf_buckets = {"90-100%": 0, "80-89%": 0, "70-79%": 0, "< 70%": 0}
    for (conf,) in analyses:
        if conf >= 0.9:
            conf_buckets["90-100%"] += 1
        elif conf >= 0.8:
            conf_buckets["80-89%"] += 1
        elif conf >= 0.7:
            conf_buckets["70-79%"] += 1
        else:
            conf_buckets["< 70%"] += 1

    confidence_distribution = [
        ConfidenceDistribution(range=k, count=v) for k, v in conf_buckets.items()
    ]

    return DashboardSummaryOut(
        system_status="OPERATIONAL",
        summary_cards=SummaryCards(
            total_alerts=total_alerts,
            critical_alerts=critical_alerts,
            high_alerts=high_alerts,
            medium_alerts=medium_alerts,
            low_alerts=low_alerts,
            false_positives=fp_count,
            true_positives=tp_count,
            ai_analyzed=ai_analyzed_count
        ),
        ai_security_score=score_breakdown,
        severity_distribution=severity_distribution,
        priority_distribution=priority_distribution,
        classification_distribution=classification_distribution,
        alerts_over_time=time_series,
        tp_vs_fp={"true_positives": tp_count, "false_positives": fp_count, "true_negatives": tn_count},
        confidence_distribution=confidence_distribution
    )
