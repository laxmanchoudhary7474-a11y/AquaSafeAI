from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from app.db.session import get_db
from app.models.alert import Alert, AlertStatus
from app.schemas.alert import AlertResponse, AlertAcknowledgeRequest, AlertResolveRequest
from app.services.alert_service import alert_service

router = APIRouter()

@router.get("/", response_model=List[AlertResponse])
def get_alerts(
    db: Session = Depends(get_db), 
    status: AlertStatus = None,
    skip: int = 0, 
    limit: int = 100
):
    query = db.query(Alert)
    if status:
        query = query.filter(Alert.status == status)
        
    alerts = query.order_by(desc(Alert.created_at)).offset(skip).limit(limit).all()
    return alerts

@router.post("/{alert_id}/acknowledge", response_model=AlertResponse)
def acknowledge_alert(alert_id: str, request: AlertAcknowledgeRequest, db: Session = Depends(get_db)):
    try:
        alert = alert_service.acknowledge_alert(alert_id, request.user_id, db)
        return alert
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{alert_id}/resolve", response_model=AlertResponse)
def resolve_alert(alert_id: str, request: AlertResolveRequest, db: Session = Depends(get_db)):
    try:
        alert = alert_service.resolve_alert(alert_id, request.user_id, request.resolution_note, db)
        return alert
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
