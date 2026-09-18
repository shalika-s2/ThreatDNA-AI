from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.analysis import AIAnalysis
from app.models.alert import Alert
from app.schemas.analysis import AIAnalysisOut, RawLogAnalysisRequest, LLMAlertAnalysisResult
from app.services.llm_service import LLMService

router = APIRouter(prefix="/analyses", tags=["AI Analyses"])

@router.get("", response_model=List[AIAnalysisOut])
def list_analyses(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(AIAnalysis).order_by(AIAnalysis.created_at.desc()).limit(limit).all()

@router.get("/{analysis_id}", response_model=AIAnalysisOut)
def get_analysis(analysis_id: int, db: Session = Depends(get_db)):
    analysis = db.query(AIAnalysis).filter(AIAnalysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    return analysis

@router.post("/raw", response_model=LLMAlertAnalysisResult)
async def analyze_raw_log(request: RawLogAnalysisRequest):
    """Direct interactive analysis of user-pasted log/payload without persisting unless requested."""
    llm_service = LLMService(provider=request.provider, model=request.model)
    result = await llm_service.analyze_alert(
        raw_log=request.raw_log,
        source_ip=request.source_ip or "192.168.1.100",
        destination_ip=request.destination_ip or "10.0.0.5",
        protocol=request.protocol or "TCP",
        attack_type=request.attack_type or "Interactive Inspection"
    )
    return result
