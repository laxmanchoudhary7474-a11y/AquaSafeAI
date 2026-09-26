from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.alert import AlertType, AlertSeverity, AlertStatus

class AlertEventResponse(BaseModel):
    id: str
    event_type: str
    message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AlertResponse(BaseModel):
    id: str
    source_id: str
    alert_type: AlertType
    severity: AlertSeverity
    title: str
    message: Optional[str] = None
    why_it_happened: Optional[str] = None
    recommended_action: Optional[str] = None
    status: AlertStatus
    triggered_by_prediction_id: Optional[str] = None
    created_at: datetime
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    
    events: List[AlertEventResponse] = []

    class Config:
        from_attributes = True

class AlertAcknowledgeRequest(BaseModel):
    user_id: str = "system_user" # placeholder until auth is added

class AlertResolveRequest(BaseModel):
    user_id: str = "system_user"
    resolution_note: str = "Resolved normally"
