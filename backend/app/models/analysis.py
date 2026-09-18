from sqlalchemy import Column, Integer, String, DateTime, Text, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class AIAnalysis(Base):
    __tablename__ = "ai_analyses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    alert_id = Column(Integer, ForeignKey("alerts.id", ondelete="CASCADE"), nullable=False, index=True)
    provider = Column(String(32), nullable=False)
    model = Column(String(64), nullable=False)
    classification = Column(String(32), nullable=False, index=True)  # malicious, benign, suspicious
    severity = Column(String(16), nullable=False)                    # critical, high, medium, low
    priority = Column(String(8), nullable=False, index=True)         # P1, P2, P3, P4
    confidence = Column(Float, nullable=False)
    false_positive_likelihood = Column(Float, nullable=False)
    reason = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    created_at = Column(DateTime, default=func.now())

    alert = relationship("Alert", back_populates="analyses")
