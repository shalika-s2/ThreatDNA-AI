from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List, Dict, Any, Optional

class DatasetBase(BaseModel):
    name: str
    ground_truth_column: str

class DatasetCreate(DatasetBase):
    pass

class DatasetOut(DatasetBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    row_count: int
    column_count: int
    created_at: datetime

class DatasetPreviewOut(BaseModel):
    id: int
    name: str
    filename: str
    row_count: int
    column_count: int
    columns: List[str]
    ground_truth_column: str
    sample_rows: List[Dict[str, Any]]
