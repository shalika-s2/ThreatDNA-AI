import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.dataset import Dataset
from app.schemas.dataset import DatasetOut, DatasetPreviewOut
from app.services.dataset_service import DatasetService

router = APIRouter(prefix="/datasets", tags=["Datasets"])

@router.get("", response_model=List[DatasetOut])
def list_datasets(db: Session = Depends(get_db)):
    return db.query(Dataset).order_by(Dataset.created_at.desc()).all()

@router.post("/upload", response_model=DatasetOut, status_code=status.HTTP_201_CREATED)
def upload_dataset(
    file: UploadFile = File(...),
    name: Optional[str] = Form(None),
    ground_truth_column: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    info = DatasetService.save_and_inspect_dataset(file, custom_name=name)
    gt_col = ground_truth_column or info["ground_truth_column"]

    dataset = Dataset(
        name=info["name"],
        filename=info["filename"],
        file_path=info["file_path"],
        row_count=info["row_count"],
        column_count=info["column_count"],
        ground_truth_column=gt_col
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)
    return dataset

@router.get("/{dataset_id}", response_model=DatasetOut)
def get_dataset(dataset_id: int, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")
    return dataset

@router.get("/{dataset_id}/preview", response_model=DatasetPreviewOut)
def preview_dataset(dataset_id: int, nrows: int = 15, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    preview_data = DatasetService.get_preview(dataset.file_path, nrows=nrows)
    return DatasetPreviewOut(
        id=dataset.id,
        name=dataset.name,
        filename=dataset.filename,
        row_count=dataset.row_count,
        column_count=dataset.column_count,
        columns=preview_data["columns"],
        ground_truth_column=dataset.ground_truth_column,
        sample_rows=preview_data["sample_rows"]
    )

@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dataset(dataset_id: int, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    if os.path.exists(dataset.file_path):
        try:
            os.remove(dataset.file_path)
        except Exception:
            pass

    db.delete(dataset)
    db.commit()
    return None
