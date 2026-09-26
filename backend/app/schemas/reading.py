from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from app.models.reading import DataSource, QualityStatus

class SensorData(BaseModel):
    ph: float = Field(..., description="pH value")
    turbidity: float = Field(..., description="Turbidity in NTU")
    tds: float = Field(..., description="Total Dissolved Solids in ppm")
    conductivity: float = Field(..., description="Electrical Conductivity in µS/cm")
    temperature: float = Field(..., description="Temperature in Celsius")

class IngestPayload(BaseModel):
    event_id: str
    device_uid: str
    source_id: str
    timestamp: datetime
    data_source: DataSource
    readings: SensorData

class SensorReadingResponse(BaseModel):
    id: str
    event_id: Optional[str] = None
    source_id: str
    device_uid: Optional[str] = None
    captured_at: datetime
    ph: float
    turbidity: float
    tds: float
    conductivity: float
    temperature: float
    data_source: DataSource
    quality_status: QualityStatus
    quality_flags: List[str]

    class Config:
        from_attributes = True
