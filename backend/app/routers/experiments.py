from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.experiment import Experiment, ExperimentResult
from app.models.dataset import Dataset
from app.schemas.experiment import ExperimentCreate, ExperimentOut, ExperimentResultOut
from app.services.experiment_service import ExperimentService

router = APIRouter(prefix="/experiments", tags=["Experiments"])

@router.get("", response_model=List[ExperimentOut])
def list_experiments(db: Session = Depends(get_db)):
    return db.query(Experiment).order_by(Experiment.created_at.desc()).all()

@router.post("", response_model=ExperimentOut, status_code=status.HTTP_201_CREATED)
def create_experiment(exp_in: ExperimentCreate, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == exp_in.dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    exp = Experiment(
        name=exp_in.name,
        dataset_id=exp_in.dataset_id,
        provider=exp_in.provider,
        model=exp_in.model,
        sample_size=exp_in.sample_size,
        status="PENDING"
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp

@router.get("/{experiment_id}", response_model=ExperimentOut)
def get_experiment(experiment_id: int, db: Session = Depends(get_db)):
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found.")
    return exp

@router.post("/{experiment_id}/run")
async def run_experiment(experiment_id: int, db: Session = Depends(get_db)):
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found.")

    if exp.status == "RUNNING":
        raise HTTPException(status_code=400, detail="Experiment is already currently running.")

    result = await ExperimentService.run_experiment_pipeline(experiment_id, db)
    return result

@router.get("/{experiment_id}/results", response_model=List[ExperimentResultOut])
def get_experiment_results(experiment_id: int, limit: int = 100, db: Session = Depends(get_db)):
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found.")

    return db.query(ExperimentResult).filter(
        ExperimentResult.experiment_id == experiment_id
    ).order_by(ExperimentResult.record_id.asc()).limit(limit).all()

@router.delete("/{experiment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_experiment(experiment_id: int, db: Session = Depends(get_db)):
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found.")

    db.delete(exp)
    db.commit()
    return None
