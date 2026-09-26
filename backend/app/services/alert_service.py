from sqlalchemy.orm import Session
from datetime import datetime, timezone
import logging

from app.models.prediction import Prediction
from app.models.source import RiskLevel, WaterSource
from app.models.alert import Alert, AlertEvent, AlertType, AlertSeverity, AlertStatus

logger = logging.getLogger(__name__)

class AlertService:
    def process_prediction(self, prediction: Prediction, db: Session) -> Alert | None:
        if prediction.risk_level not in [RiskLevel.HIGH, RiskLevel.CRITICAL]:
            return None # No alert needed for LOW or MODERATE risk

        # Determine type and severity
        alert_type = AlertType.CRITICAL_RISK if prediction.risk_level == RiskLevel.CRITICAL else AlertType.HIGH_RISK
        severity = AlertSeverity.CRITICAL if prediction.risk_level == RiskLevel.CRITICAL else AlertSeverity.HIGH
        
        # Check for existing active alerts for this source
        active_alert = db.query(Alert)\
            .filter(Alert.source_id == prediction.source_id)\
            .filter(Alert.status.in_([AlertStatus.NEW, AlertStatus.ACKNOWLEDGED]))\
            .first()

        source_name = db.query(WaterSource).filter(WaterSource.id == prediction.source_id).first().name

        if active_alert:
            # Deduplication logic: If there's an existing alert, just append an event if severity escalated or periodically
            if active_alert.severity != severity and severity == AlertSeverity.CRITICAL:
                # Escalation
                active_alert.severity = severity
                active_alert.alert_type = alert_type
                active_alert.title = f"ESCALATED: Critical Risk at {source_name}"
                active_alert.message = f"Risk has escalated to {prediction.risk_score:.1f}%"
                
                event = AlertEvent(
                    alert_id=active_alert.id,
                    event_type="ESCALATED",
                    message=f"Risk escalated to CRITICAL ({prediction.risk_score:.1f}%)"
                )
                db.add(event)
                db.commit()
                db.refresh(active_alert)
                return active_alert
            else:
                # Just update the triggered prediction silently, no new alert
                active_alert.triggered_by_prediction_id = prediction.id
                db.commit()
                return None
        else:
            # Create a NEW alert
            new_alert = Alert(
                source_id=prediction.source_id,
                alert_type=alert_type,
                severity=severity,
                title=f"{severity.value.title()} Risk Detected at {source_name}",
                message=f"AI Risk Estimate reached {prediction.risk_score:.1f}%.",
                why_it_happened=prediction.explanation,
                recommended_action="Investigate sensor readings and schedule a physical inspection if necessary.",
                triggered_by_prediction_id=prediction.id
            )
            db.add(new_alert)
            db.commit()
            db.refresh(new_alert)

            event = AlertEvent(
                alert_id=new_alert.id,
                event_type="CREATED",
                message=f"Alert generated due to AI Risk Score {prediction.risk_score:.1f}%"
            )
            db.add(event)
            db.commit()
            
            logger.info(f"New Alert Generated: {new_alert.title}")
            return new_alert

    def acknowledge_alert(self, alert_id: str, user_id: str, db: Session) -> Alert:
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if not alert:
            raise ValueError("Alert not found")
        if alert.status == AlertStatus.RESOLVED:
            raise ValueError("Cannot acknowledge a resolved alert")

        if alert.status == AlertStatus.NEW:
            alert.status = AlertStatus.ACKNOWLEDGED
            alert.acknowledged_at = datetime.now(timezone.utc)
            alert.acknowledged_by = user_id
            
            event = AlertEvent(
                alert_id=alert.id,
                event_type="ACKNOWLEDGED",
                message=f"Alert acknowledged by {user_id}"
            )
            db.add(event)
            db.commit()
            db.refresh(alert)
        return alert

    def resolve_alert(self, alert_id: str, user_id: str, resolution_note: str, db: Session) -> Alert:
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if not alert:
            raise ValueError("Alert not found")
            
        alert.status = AlertStatus.RESOLVED
        alert.resolved_at = datetime.now(timezone.utc)
        alert.resolved_by = user_id
        
        event = AlertEvent(
            alert_id=alert.id,
            event_type="RESOLVED",
            message=f"Alert resolved by {user_id}. Note: {resolution_note}"
        )
        db.add(event)
        db.commit()
        db.refresh(alert)
        return alert

alert_service = AlertService()
