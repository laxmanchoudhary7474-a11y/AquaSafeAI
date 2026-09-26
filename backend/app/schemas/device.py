from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.device import DeviceStatus

class DeviceBase(BaseModel):
    device_uid: str
    source_id: str
    firmware_version: Optional[str] = None

class DeviceCreate(DeviceBase):
    pass

class DeviceResponse(DeviceBase):
    status: DeviceStatus
    last_seen_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True
