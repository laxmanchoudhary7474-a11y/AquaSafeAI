from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.source import RiskLevel, TrendDirection

class WaterSourceBase(BaseModel):
    name: str
    location: Optional[str] = None

class WaterSourceCreate(WaterSourceBase):
    pass

class WaterSourceResponse(WaterSourceBase):
    id: str
    safety_score: float
    risk_level: RiskLevel
    trend: TrendDirection
    last_update: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True
