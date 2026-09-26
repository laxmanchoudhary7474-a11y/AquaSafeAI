from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
import uuid

from app.db.session import Base

class DataSource(str, enum.Enum):
    DEVICE = "DEVICE"
    SIMULATION = "SIMULATION"

class QualityStatus(str, enum.Enum):
    VALID = "VALID"
    WARNING = "WARNING"
    INVALID = "INVALID"
    STALE = "STALE"

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source_id = Column(String, ForeignKey("water_sources.id"), nullable=False)
    device_uid = Column(String, ForeignKey("devices.device_uid"), nullable=True)
    event_id = Column(String, unique=True, index=True)
    
    captured_at = Column(DateTime(timezone=True), index=True)
    
    ph = Column(Float)
    turbidity = Column(Float)
    tds = Column(Float)
    conductivity = Column(Float)
    temperature = Column(Float)
    
    data_source = Column(Enum(DataSource), nullable=False)
    quality_status = Column(Enum(QualityStatus), default=QualityStatus.VALID)
    quality_flags = Column(JSON, default=list) # Store list of strings describing issues
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    water_source = relationship("WaterSource")
    device = relationship("Device")
