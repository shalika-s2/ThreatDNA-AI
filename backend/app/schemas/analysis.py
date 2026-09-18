from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional

class LLMAlertAnalysisResult(BaseModel):
    classification: str = Field(..., description="malicious, benign, or suspicious")
    severity: str = Field(..., description="critical, high, medium, or low")
    priority: str = Field(..., description="P1, P2, P3, or P4")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0")
    false_positive_likelihood: float = Field(..., ge=0.0, le=1.0, description="Estimated false positive probability")
    reason: str = Field(..., description="Concise security justification without raw chain-of-thought")
    recommended_action: str = Field(..., description="Actionable SOC mitigation instruction")

class RawLogAnalysisRequest(BaseModel):
    raw_log: str
    source_ip: Optional[str] = "Unknown"
    destination_ip: Optional[str] = "Unknown"
    protocol: Optional[str] = "TCP"
    attack_type: Optional[str] = "Generic IDS Alert"
    provider: Optional[str] = None
    model: Optional[str] = None

class AIAnalysisCreate(LLMAlertAnalysisResult):
    alert_id: int
    provider: str
    model: str

class AIAnalysisOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    alert_id: int
    provider: str
    model: str
    classification: str
    severity: str
    priority: str
    confidence: float
    false_positive_likelihood: float
    reason: str
    recommended_action: str
    created_at: datetime
