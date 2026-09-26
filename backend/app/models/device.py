from sqlalchemy import Column, String, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.db.session import Base

class DeviceStatus(str, enum.Enum):
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"
    STALE = "STALE"

class Device(Base):
    __tablename__ = "devices"

    device_uid = Column(String, primary_key=True)
    source_id = Column(String, ForeignKey("water_sources.id"), nullable=False)
    
    status = Column(Enum(DeviceStatus), default=DeviceStatus.OFFLINE)
    firmware_version = Column(String)
    last_seen_at = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    source = relationship("WaterSource", back_populates="devices")
