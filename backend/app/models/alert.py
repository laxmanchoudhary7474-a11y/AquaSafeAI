from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
import uuid

from app.db.session import Base
from app.models.source import RiskLevel

class AlertType(str, enum.Enum):
    ANOMALY = "ANOMALY"
    HIGH_RISK = "HIGH_RISK"
    CRITICAL_RISK = "CRITICAL_RISK"
    DEVICE_OFFLINE = "DEVICE_OFFLINE"
    DATA_QUALITY = "DATA_QUALITY"

class AlertSeverity(str, enum.Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class AlertStatus(str, enum.Enum):
    NEW = "NEW"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    RESOLVED = "RESOLVED"

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source_id = Column(String, ForeignKey("water_sources.id"), nullable=False)
    
    alert_type = Column(Enum(AlertType), nullable=False)
    severity = Column(Enum(AlertSeverity), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text)
    why_it_happened = Column(Text)
    recommended_action = Column(Text)
    
    status = Column(Enum(AlertStatus), default=AlertStatus.NEW)
    triggered_by_prediction_id = Column(String, ForeignKey("predictions.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    acknowledged_by = Column(String, nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolved_by = Column(String, nullable=True)

    source = relationship("WaterSource")
    prediction = relationship("Prediction")
    events = relationship("AlertEvent", back_populates="alert", cascade="all, delete-orphan")

class AlertEvent(Base):
    __tablename__ = "alert_events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    alert_id = Column(String, ForeignKey("alerts.id"), nullable=False)
    
    event_type = Column(String) # e.g. "CREATED", "UPDATED", "ESCALATED", "ACKNOWLEDGED", "RESOLVED"
    message = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    alert = relationship("Alert", back_populates="events")
