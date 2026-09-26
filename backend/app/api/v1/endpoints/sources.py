from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.source import WaterSource
from app.schemas.source import WaterSourceCreate, WaterSourceResponse

router = APIRouter()

@router.get("/", response_model=List[WaterSourceResponse])
def get_sources(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    sources = db.query(WaterSource).offset(skip).limit(limit).all()
    return sources

@router.post("/", response_model=WaterSourceResponse)
def create_source(source: WaterSourceCreate, db: Session = Depends(get_db)):
    db_source = WaterSource(name=source.name, location=source.location)
    db.add(db_source)
    db.commit()
    db.refresh(db_source)
    return db_source

@router.get("/{source_id}", response_model=WaterSourceResponse)
def get_source(source_id: str, db: Session = Depends(get_db)):
    db_source = db.query(WaterSource).filter(WaterSource.id == source_id).first()
    if db_source is None:
        raise HTTPException(status_code=404, detail="Source not found")
    return db_source

from app.models.reading import SensorReading
from app.schemas.reading import SensorReadingResponse
from app.models.prediction import Prediction

@router.get("/{source_id}/latest", response_model=SensorReadingResponse)
def get_latest_reading(source_id: str, db: Session = Depends(get_db)):
    reading = db.query(SensorReading).filter(SensorReading.source_id == source_id).order_by(SensorReading.captured_at.desc()).first()
    if not reading:
        raise HTTPException(status_code=404, detail="No readings found")
    return reading

@router.get("/{source_id}/readings")
def get_readings(source_id: str, db: Session = Depends(get_db), limit: int = 50):
    results = db.query(SensorReading, Prediction)\
        .outerjoin(Prediction, Prediction.reading_id == SensorReading.id)\
        .filter(SensorReading.source_id == source_id)\
        .order_by(SensorReading.captured_at.desc())\
        .limit(limit)\
        .all()
    
    out = []
    for reading, pred in results:
        out.append({
            "id": reading.id,
            "captured_at": reading.captured_at,
            "ph": reading.ph,
            "turbidity": reading.turbidity,
            "tds": reading.tds,
            "conductivity": reading.conductivity,
            "temperature": reading.temperature,
            "risk_score": pred.risk_score if pred else 0
        })
    return out

@router.get("/{source_id}/prediction")
def get_latest_prediction(source_id: str, db: Session = Depends(get_db)):
    prediction = db.query(Prediction).filter(Prediction.source_id == source_id).order_by(Prediction.created_at.desc()).first()
    if not prediction:
        raise HTTPException(status_code=404, detail="No predictions found")
    
    return {
        "risk_score": prediction.risk_score,
        "risk_level": prediction.risk_level.value if hasattr(prediction.risk_level, 'value') else prediction.risk_level,
        "explanation": prediction.explanation,
        "factors": [
            {
                "parameter": f.parameter,
                "direction": f.direction.value if hasattr(f.direction, 'value') else f.direction,
                "relative_change": f.relative_change,
                "contribution": f.contribution,
                "baseline": getattr(f, "baseline", None),
                "current": getattr(f, "current", None)
            } for f in prediction.factors
        ]
    }
