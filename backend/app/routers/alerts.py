import random
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from app.core.database import get_db
from app.models.alert import Alert
from app.models.analysis import AIAnalysis
from app.schemas.alert import AlertCreate, AlertUpdate, AlertOut, AlertListResponse
from app.schemas.analysis import AIAnalysisOut, LLMAlertAnalysisResult
from app.services.llm_service import LLMService

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("", response_model=AlertListResponse)
def list_alerts(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    attack_type: Optional[str] = None,
    classification: Optional[str] = None,
    priority: Optional[str] = None,
    sort_by: str = "timestamp",
    sort_order: str = "desc",
    db: Session = Depends(get_db)
):
    query = db.query(Alert)

    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                Alert.alert_id.ilike(s),
                Alert.source_ip.ilike(s),
                Alert.destination_ip.ilike(s),
                Alert.attack_type.ilike(s),
                Alert.signature.ilike(s),
                Alert.raw_log.ilike(s)
            )
        )

    if severity:
        query = query.filter(Alert.severity == severity.upper())

    if status:
        query = query.filter(Alert.status == status.upper())

    if attack_type:
        query = query.filter(Alert.attack_type.ilike(f"%{attack_type}%"))

    if classification or priority:
        query = query.join(Alert.analyses)
        if classification:
            query = query.filter(AIAnalysis.classification == classification.lower())
        if priority:
            query = query.filter(AIAnalysis.priority == priority.upper())

    # Sorting
    sort_column = getattr(Alert, sort_by, Alert.timestamp)
    if sort_order.lower() == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    total = query.count()
    alerts = query.offset((page - 1) * page_size).limit(page_size).all()

    return AlertListResponse(
        total=total,
        page=page,
        page_size=page_size,
        alerts=alerts
    )

@router.post("", response_model=AlertOut, status_code=status.HTTP_201_CREATED)
def create_alert(alert_in: AlertCreate, db: Session = Depends(get_db)):
    if not alert_in.alert_id:
        count = db.query(Alert).count() + 1
        generated_id = f"ALR-{str(count).zfill(4)}"
        alert_in.alert_id = generated_id

    alert = Alert(
        alert_id=alert_in.alert_id,
        timestamp=alert_in.timestamp or datetime.now(),
        source_ip=alert_in.source_ip,
        destination_ip=alert_in.destination_ip,
        source_port=alert_in.source_port,
        destination_port=alert_in.destination_port,
        protocol=alert_in.protocol,
        attack_type=alert_in.attack_type,
        signature=alert_in.signature,
        raw_log=alert_in.raw_log,
        severity=alert_in.severity.upper(),
        status=alert_in.status.upper()
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert

@router.get("/{alert_id_or_pk}", response_model=AlertOut)
def get_alert(alert_id_or_pk: str, db: Session = Depends(get_db)):
    if alert_id_or_pk.isdigit():
        alert = db.query(Alert).filter(Alert.id == int(alert_id_or_pk)).first()
    else:
        alert = db.query(Alert).filter(Alert.alert_id == alert_id_or_pk).first()

    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    return alert

@router.patch("/{alert_id_or_pk}", response_model=AlertOut)
def update_alert(alert_id_or_pk: str, update_in: AlertUpdate, db: Session = Depends(get_db)):
    if alert_id_or_pk.isdigit():
        alert = db.query(Alert).filter(Alert.id == int(alert_id_or_pk)).first()
    else:
        alert = db.query(Alert).filter(Alert.alert_id == alert_id_or_pk).first()

    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")

    if update_in.severity:
        alert.severity = update_in.severity.upper()
    if update_in.status:
        alert.status = update_in.status.upper()
    if update_in.attack_type:
        alert.attack_type = update_in.attack_type

    db.commit()
    db.refresh(alert)
    return alert

@router.delete("/{alert_id_or_pk}", status_code=status.HTTP_204_NO_CONTENT)
def delete_alert(alert_id_or_pk: str, db: Session = Depends(get_db)):
    if alert_id_or_pk.isdigit():
        alert = db.query(Alert).filter(Alert.id == int(alert_id_or_pk)).first()
    else:
        alert = db.query(Alert).filter(Alert.alert_id == alert_id_or_pk).first()

    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")

    db.delete(alert)
    db.commit()
    return None

@router.post("/{alert_id_or_pk}/analyze", response_model=AIAnalysisOut)
async def analyze_alert_with_ai(
    alert_id_or_pk: str,
    provider: Optional[str] = None,
    model: Optional[str] = None,
    db: Session = Depends(get_db)
):
    if alert_id_or_pk.isdigit():
        alert = db.query(Alert).filter(Alert.id == int(alert_id_or_pk)).first()
    else:
        alert = db.query(Alert).filter(Alert.alert_id == alert_id_or_pk).first()

    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")

    llm_service = LLMService(provider=provider, model=model)
    result: LLMAlertAnalysisResult = await llm_service.analyze_alert(
        raw_log=alert.raw_log,
        source_ip=alert.source_ip,
        destination_ip=alert.destination_ip,
        source_port=str(alert.source_port or 0),
        destination_port=str(alert.destination_port or 0),
        protocol=alert.protocol,
        attack_type=alert.attack_type,
        signature=alert.signature
    )

    # Save to database
    analysis = AIAnalysis(
        alert_id=alert.id,
        provider=llm_service.provider,
        model=llm_service.model,
        classification=result.classification.lower(),
        severity=result.severity.lower(),
        priority=result.priority.upper(),
        confidence=result.confidence,
        false_positive_likelihood=result.false_positive_likelihood,
        reason=result.reason,
        recommended_action=result.recommended_action
    )
    db.add(analysis)

    # Optionally adjust alert status/severity if high confidence
    if result.false_positive_likelihood > 0.8:
        alert.status = "FALSE_POSITIVE"
    elif alert.status == "NEW":
        alert.status = "INVESTIGATING"

    db.commit()
    db.refresh(analysis)
    return analysis
