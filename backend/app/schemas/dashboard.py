from pydantic import BaseModel
from typing import List, Dict, Any

class SummaryCards(BaseModel):
    total_alerts: int
    critical_alerts: int
    high_alerts: int
    medium_alerts: int
    low_alerts: int
    false_positives: int
    true_positives: int
    ai_analyzed: int

class ScoreBreakdown(BaseModel):
    overall_score: int  # 0 to 100
    precision_factor: float
    fp_reduction_factor: float
    confidence_factor: float
    coverage_factor: float
    formula_explanation: str

class SeverityCount(BaseModel):
    severity: str
    count: int

class PriorityCount(BaseModel):
    priority: str
    count: int

class ClassificationCount(BaseModel):
    classification: str
    count: int

class TimeSeriesPoint(BaseModel):
    timestamp: str
    count: int
    critical: int
    high: int
    medium: int
    low: int

class ConfidenceDistribution(BaseModel):
    range: str
    count: int

class DashboardSummaryOut(BaseModel):
    system_status: str
    summary_cards: SummaryCards
    ai_security_score: ScoreBreakdown
    severity_distribution: List[SeverityCount]
    priority_distribution: List[PriorityCount]
    classification_distribution: List[ClassificationCount]
    alerts_over_time: List[TimeSeriesPoint]
    tp_vs_fp: Dict[str, int]
    confidence_distribution: List[ConfidenceDistribution]
