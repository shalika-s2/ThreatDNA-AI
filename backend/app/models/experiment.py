from sqlalchemy import Column, Integer, String, DateTime, Text, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(128), nullable=False)
    provider = Column(String(32), nullable=False)
    model = Column(String(64), nullable=False)
    status = Column(String(32), default="PENDING", nullable=False, index=True)  # PENDING, RUNNING, COMPLETED, FAILED
    total_records = Column(Integer, default=0, nullable=False)
    sample_size = Column(Integer, default=0, nullable=False)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())

    dataset = relationship("Dataset", back_populates="experiments")
    results = relationship("ExperimentResult", back_populates="experiment", cascade="all, delete-orphan")
    metric = relationship("Metric", back_populates="experiment", uselist=False, cascade="all, delete-orphan")


class ExperimentResult(Base):
    __tablename__ = "experiment_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    experiment_id = Column(Integer, ForeignKey("experiments.id", ondelete="CASCADE"), nullable=False, index=True)
    record_id = Column(Integer, nullable=False)
    ground_truth = Column(String(32), nullable=False)
    prediction = Column(String(32), nullable=False)
    confidence = Column(Float, nullable=False)
    severity = Column(String(16), nullable=False)
    priority = Column(String(8), nullable=False)
    fp_likelihood = Column(Float, nullable=False)
    is_correct = Column(Boolean, nullable=False, index=True)
    created_at = Column(DateTime, default=func.now())

    experiment = relationship("Experiment", back_populates="results")
