from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    alert_id = Column(String(32), unique=True, index=True, nullable=False)
    timestamp = Column(DateTime, nullable=False, default=func.now(), index=True)
    source_ip = Column(String(45), nullable=False)
    destination_ip = Column(String(45), nullable=False)
    source_port = Column(Integer, nullable=True)
    destination_port = Column(Integer, nullable=True)
    protocol = Column(String(16), nullable=False)
    attack_type = Column(String(64), nullable=False, index=True)
    signature = Column(String(255), nullable=False)
    raw_log = Column(Text, nullable=False)
    severity = Column(String(16), nullable=False, index=True)  # CRITICAL, HIGH, MEDIUM, LOW
    status = Column(String(32), default="NEW", nullable=False, index=True)  # NEW, INVESTIGATING, ESCALATED, RESOLVED, FALSE_POSITIVE
    created_at = Column(DateTime, default=func.now())

    analyses = relationship("AIAnalysis", back_populates="alert", cascade="all, delete-orphan")
