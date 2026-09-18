from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List
from app.schemas.dataset import DatasetOut

class ExperimentBase(BaseModel):
    name: str
    dataset_id: int
    provider: str
    model: str
    sample_size: int = 20

class ExperimentCreate(ExperimentBase):
    pass

class ExperimentResultOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    record_id: int
    ground_truth: str
    prediction: str
    confidence: float
    severity: str
    priority: str
    fp_likelihood: float
    is_correct: bool
    created_at: datetime

class ExperimentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    dataset_id: int
    provider: str
    model: str
    status: str
    total_records: int
    sample_size: int
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    dataset: Optional[DatasetOut] = None
