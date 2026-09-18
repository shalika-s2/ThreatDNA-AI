from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(128), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    row_count = Column(Integer, default=0, nullable=False)
    column_count = Column(Integer, default=0, nullable=False)
    ground_truth_column = Column(String(64), nullable=False)
    created_at = Column(DateTime, default=func.now())

    experiments = relationship("Experiment", back_populates="dataset", cascade="all, delete-orphan")
