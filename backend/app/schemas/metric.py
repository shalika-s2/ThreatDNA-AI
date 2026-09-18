from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, Dict, Any, List

class MetricOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    experiment_id: int
    true_positive: int
    true_negative: int
    false_positive: int
    false_negative: int
    precision_score: float
    recall_score: float
    f1_score: float
    false_positive_rate: float
    accuracy_score: float
    total_samples: int
    created_at: datetime

class TraditionalComparisonItem(BaseModel):
    metric_name: str
    traditional_value: str
    llm_value: str
    difference: str
    description: str

class ExperimentReportOut(BaseModel):
    experiment_id: int
    experiment_name: str
    dataset_name: str
    provider: str
    model: str
    status: str
    sample_size: int
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    metrics: Optional[MetricOut]
    comparisons: List[TraditionalComparisonItem]
    confusion_matrix: Dict[str, int]
    key_findings: List[str]
