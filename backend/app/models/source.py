from sqlalchemy import Column, String, Float, DateTime, Enum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum

from app.db.session import Base

class RiskLevel(str, enum.Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class TrendDirection(str, enum.Enum):
    RISING = "RISING"
    STABLE = "STABLE"
    FALLING = "FALLING"

class WaterSource(Base):
    __tablename__ = "water_sources"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, index=True, nullable=False)
    location = Column(String)
    
    # Current Status (Updated by AI Engine)
    safety_score = Column(Float, default=100.0) # 0-100
    risk_level = Column(Enum(RiskLevel), default=RiskLevel.LOW)
    trend = Column(Enum(TrendDirection), default=TrendDirection.STABLE)
    last_update = Column(DateTime(timezone=True), onupdate=func.now())
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    devices = relationship("Device", back_populates="source")
