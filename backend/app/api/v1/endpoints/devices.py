from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.device import Device
from app.models.source import WaterSource
from app.schemas.device import DeviceCreate, DeviceResponse

router = APIRouter()

@router.get("/", response_model=List[DeviceResponse])
def get_devices(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    devices = db.query(Device).offset(skip).limit(limit).all()
    return devices

@router.post("/", response_model=DeviceResponse)
def create_device(device: DeviceCreate, db: Session = Depends(get_db)):
    # Check if source exists
    source = db.query(WaterSource).filter(WaterSource.id == device.source_id).first()
    if not source:
        raise HTTPException(status_code=400, detail="WaterSource not found")
        
    db_device = db.query(Device).filter(Device.device_uid == device.device_uid).first()
    if db_device:
        raise HTTPException(status_code=400, detail="Device already registered")
        
    db_device = Device(
        device_uid=device.device_uid,
        source_id=device.source_id,
        firmware_version=device.firmware_version
    )
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    return db_device
