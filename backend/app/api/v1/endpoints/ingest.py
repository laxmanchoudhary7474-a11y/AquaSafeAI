from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.reading import IngestPayload, SensorReadingResponse
from app.services.ingestion_service import ingestion_service

router = APIRouter()

@router.post("/readings", response_model=SensorReadingResponse)
def ingest_reading(
    payload: IngestPayload, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    try:
        reading = ingestion_service.process_reading(payload, db)
        # TODO: Trigger async feature engineering & risk engine
        return reading
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
