from sqlalchemy.orm import Session
import logging
from app.schemas.reading import IngestPayload
from app.models.reading import SensorReading, QualityStatus
from app.models.source import WaterSource
from app.services.data_quality_service import data_quality_service
from app.services.realtime_service import realtime_manager
from app.services.alert_service import alert_service
from app.ml.risk_engine import risk_engine
import asyncio

logger = logging.getLogger(__name__)

class IngestionService:
    @staticmethod
    def process_reading(payload: IngestPayload, db: Session) -> SensorReading:
        # Verify Source
        source = db.query(WaterSource).filter(WaterSource.id == payload.source_id).first()
        if not source:
            raise ValueError("WaterSource not found")

        # Duplicate Check
        existing = db.query(SensorReading).filter(SensorReading.event_id == payload.event_id).first()
        if existing:
            return existing

        # Data Quality Layer
        quality_status, flags = data_quality_service.validate_payload(payload)

        if quality_status == QualityStatus.INVALID:
            logger.warning(f"Invalid payload ingested as SUSPECT: {payload.event_id}. Flags: {flags}")
            quality_status = QualityStatus.SUSPECT

        # Storage
        db_reading = SensorReading(
            event_id=payload.event_id,
            device_uid=payload.device_uid,
            source_id=payload.source_id,
            captured_at=payload.timestamp,
            ph=payload.readings.ph,
            turbidity=payload.readings.turbidity,
            tds=payload.readings.tds,
            conductivity=payload.readings.conductivity,
            temperature=payload.readings.temperature,
            data_source=payload.data_source,
            quality_status=quality_status,
            quality_flags=flags
        )
        db.add(db_reading)
        db.commit()
        db.refresh(db_reading)
        
        # Evaluate AI Risk
        prediction = risk_engine.evaluate_risk(db_reading, db)
        
        # Evaluate Alerts
        new_alert = alert_service.process_prediction(prediction, db)
        
        # Broadcast the new reading and prediction asynchronously
        try:
            loop = asyncio.get_running_loop()
            
            # Fetch updated source
            updated_source = db.query(WaterSource).filter(WaterSource.id == db_reading.source_id).first()
            
            loop.create_task(realtime_manager.broadcast({
                "type": "NEW_READING",
                "source_id": db_reading.source_id,
                "reading": {
                    "id": db_reading.id,
                    "captured_at": db_reading.captured_at.isoformat(),
                    "ph": db_reading.ph,
                    "turbidity": db_reading.turbidity,
                    "tds": db_reading.tds,
                    "conductivity": db_reading.conductivity,
                    "temperature": db_reading.temperature,
                    "quality_status": db_reading.quality_status.value
                },
                "prediction": {
                    "risk_score": prediction.risk_score,
                    "risk_level": prediction.risk_level.value,
                    "explanation": prediction.explanation,
                    "factors": [
                        {
                            "parameter": f.parameter,
                            "direction": f.direction.value if hasattr(f.direction, 'value') else f.direction,
                            "relative_change": f.relative_change,
                            "contribution": f.contribution,
                            "baseline": getattr(f, "baseline", None),
                            "current": getattr(f, "current", None)
                        } for f in getattr(prediction, 'active_factors', [])
                    ]
                },
                "source": {
                    "safety_score": updated_source.safety_score,
                    "trend": updated_source.trend.value
                },
                "new_alert": {
                    "id": new_alert.id,
                    "title": new_alert.title,
                    "severity": new_alert.severity.value
                } if new_alert else None
            }))
        except RuntimeError:
            pass # No running event loop
        
        return db_reading

ingestion_service = IngestionService()
