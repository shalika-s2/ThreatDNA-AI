from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, List
from app.schemas.analysis import AIAnalysisOut

class AlertBase(BaseModel):
    source_ip: str
    destination_ip: str
    source_port: Optional[int] = None
    destination_port: Optional[int] = None
    protocol: str = "TCP"
    attack_type: str
    signature: str
    raw_log: str
    severity: str = "MEDIUM"  # CRITICAL, HIGH, MEDIUM, LOW
    status: str = "NEW"       # NEW, INVESTIGATING, ESCALATED, RESOLVED, FALSE_POSITIVE

class AlertCreate(AlertBase):
    alert_id: Optional[str] = None
    timestamp: Optional[datetime] = None

class AlertUpdate(BaseModel):
    severity: Optional[str] = None
    status: Optional[str] = None
    attack_type: Optional[str] = None

class AlertOut(AlertBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    alert_id: str
    timestamp: datetime
    created_at: datetime
    analyses: List[AIAnalysisOut] = []

class AlertListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    alerts: List[AlertOut]
