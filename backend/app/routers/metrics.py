from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.metric import Metric
from app.models.experiment import Experiment
from app.schemas.metric import MetricOut, TraditionalComparisonItem
from app.services.metrics_service import MetricsService

router = APIRouter(prefix="/metrics", tags=["Research Metrics"])

@router.get("/{experiment_id}", response_model=MetricOut)
def get_experiment_metrics(experiment_id: int, db: Session = Depends(get_db)):
    metric = db.query(Metric).filter(Metric.experiment_id == experiment_id).first()
    if not metric:
        raise HTTPException(status_code=404, detail="Metrics not found for this experiment. Has it completed?")
    return metric

@router.get("/{experiment_id}/comparison", response_model=List[TraditionalComparisonItem])
def get_traditional_comparison(
    experiment_id: int,
    baseline_fpr: float = 0.285,
    baseline_precision: float = 0.652,
    baseline_recall: float = 0.880,
    baseline_f1: float = 0.749,
    db: Session = Depends(get_db)
):
    metric = db.query(Metric).filter(Metric.experiment_id == experiment_id).first()
    if not metric:
        raise HTTPException(status_code=404, detail="Metrics not found for this experiment.")

    metric_dict = {
        "true_positive": metric.true_positive,
        "true_negative": metric.true_negative,
        "false_positive": metric.false_positive,
        "false_negative": metric.false_negative,
        "precision_score": metric.precision_score,
        "recall_score": metric.recall_score,
        "f1_score": metric.f1_score,
        "false_positive_rate": metric.false_positive_rate,
        "accuracy_score": metric.accuracy_score,
        "total_samples": metric.total_samples
    }

    return MetricsService.generate_traditional_vs_llm_comparison(
        metrics=metric_dict,
        baseline_fpr=baseline_fpr,
        baseline_precision=baseline_precision,
        baseline_recall=baseline_recall,
        baseline_f1=baseline_f1
    )
