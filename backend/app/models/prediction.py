from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Integer, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
import uuid

from app.db.session import Base
from app.models.source import RiskLevel

class Direction(str, enum.Enum):
    UP = "UP"
    DOWN = "DOWN"
    STABLE = "STABLE"

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source_id = Column(String, ForeignKey("water_sources.id"), nullable=False)
    reading_id = Column(String, ForeignKey("sensor_readings.id"), nullable=False)
    
    anomaly_score = Column(Float)
    risk_score = Column(Float) # 0-100
    risk_level = Column(Enum(RiskLevel))
    model_version = Column(String, default="mvp-heuristic-v1")
    input_quality = Column(String)
    explanation = Column(String)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    factors = relationship("RiskFactor", back_populates="prediction", cascade="all, delete-orphan")

class RiskFactor(Base):
    __tablename__ = "risk_factors"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    prediction_id = Column(String, ForeignKey("predictions.id"), nullable=False)
    
    parameter = Column(String) # e.g. "turbidity"
    direction = Column(Enum(Direction))
    relative_change = Column(Float) # percentage change from baseline
    contribution = Column(Float) # how much this factor contributed to the risk score
    explanation = Column(String)
    
    prediction = relationship("Prediction", back_populates="factors")
