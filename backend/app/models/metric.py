from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Metric(Base):
    __tablename__ = "metrics"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    experiment_id = Column(Integer, ForeignKey("experiments.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    true_positive = Column(Integer, default=0, nullable=False)
    true_negative = Column(Integer, default=0, nullable=False)
    false_positive = Column(Integer, default=0, nullable=False)
    false_negative = Column(Integer, default=0, nullable=False)
    precision_score = Column(Float, default=0.0, nullable=False)
    recall_score = Column(Float, default=0.0, nullable=False)
    f1_score = Column(Float, default=0.0, nullable=False)
    false_positive_rate = Column(Float, default=0.0, nullable=False)
    accuracy_score = Column(Float, default=0.0, nullable=False)
    total_samples = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=func.now())

    experiment = relationship("Experiment", back_populates="metric")
