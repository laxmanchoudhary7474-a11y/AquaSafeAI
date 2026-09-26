import asyncio
import uuid
from datetime import datetime, timedelta, timezone
from app.db.session import SessionLocal, engine, Base
from app.models.source import WaterSource, RiskLevel, TrendDirection
from app.models.device import Device, DeviceStatus
from app.models.reading import SensorReading, DataSource, QualityStatus
import random

def seed_data():
    print("Seeding database with stimulated prototype data...")
    db = SessionLocal()
    
    # Drop existing tables to ensure a fresh demo environment
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    # 1. Create Sources
    source_north = WaterSource(
        id="source-north",
        name="North Zone Reservoir",
        location="Zone 1",
        safety_score=85.0,
        risk_level=RiskLevel.LOW,
        trend=TrendDirection.STABLE
    )
    
    source_campus = WaterSource(
        id="source-campus",
        name="Campus Groundwater Tank",
        location="Zone 2",
        safety_score=92.0,
        risk_level=RiskLevel.LOW,
        trend=TrendDirection.STABLE
    )

    source_etp = WaterSource(
        id="source-etp",
        name="Industrial ETP — Plant A",
        location="Zone 3",
        safety_score=68.0,
        risk_level=RiskLevel.MODERATE,
        trend=TrendDirection.STABLE
    )

    source_east = WaterSource(
        id="source-east",
        name="East Distribution Point",
        location="Zone 4",
        safety_score=95.0,
        risk_level=RiskLevel.LOW,
        trend=TrendDirection.STABLE
    )

    # 2. Create Devices
    device_1 = Device(device_uid="ESP32-WATER-01", source_id="source-north", status=DeviceStatus.ONLINE, firmware_version="v2.1.0")
    device_2 = Device(device_uid="ESP32-WATER-02", source_id="source-campus", status=DeviceStatus.STALE, firmware_version="v2.1.0")
    device_3 = Device(device_uid="ESP32-WATER-03", source_id="source-etp", status=DeviceStatus.ONLINE, firmware_version="v2.0.1")
    device_4 = Device(device_uid="ESP32-WATER-04", source_id="source-east", status=DeviceStatus.OFFLINE, firmware_version="v1.8.0")

    db.add_all([source_north, source_campus, source_etp, source_east])
    db.add_all([device_1, device_2, device_3, device_4])
    db.commit()

    # 3. Generate Historical Readings (24 hours, every 5 minutes = 288 readings)
    print("Generating 24-hour historical sensor data...")
    now = datetime.now(timezone.utc)
    readings = []
    
    total_points = 288
    
    for i in range(total_points):
        t = now - timedelta(minutes=(total_points - i) * 5)
        
        # --- Campus Groundwater (Healthy) ---
        readings.append(SensorReading(
            id=str(uuid.uuid4()), source_id="source-campus", device_uid="ESP32-WATER-02", captured_at=t,
            ph=round(random.uniform(7.1, 7.3), 2), turbidity=round(random.uniform(1.5, 2.5), 2),
            tds=round(random.uniform(300, 320), 1), conductivity=round(random.uniform(450, 490), 1),
            temperature=round(random.uniform(27, 29), 1), data_source=DataSource.SIMULATION, quality_status=QualityStatus.VALID
        ))

        # --- Industrial ETP (Borderline but stable) ---
        readings.append(SensorReading(
            id=str(uuid.uuid4()), source_id="source-etp", device_uid="ESP32-WATER-03", captured_at=t,
            ph=round(random.uniform(6.8, 7.0), 2), turbidity=round(random.uniform(4.0, 5.0), 2),
            tds=round(random.uniform(400, 420), 1), conductivity=round(random.uniform(550, 580), 1),
            temperature=round(random.uniform(28, 30), 1), data_source=DataSource.SIMULATION, quality_status=QualityStatus.VALID
        ))

        # --- East Distribution (Offline, last reading older) ---
        if i < total_points - 50: # Stopped 50 points ago
            readings.append(SensorReading(
                id=str(uuid.uuid4()), source_id="source-east", device_uid="ESP32-WATER-04", captured_at=t,
                ph=round(random.uniform(7.0, 7.2), 2), turbidity=round(random.uniform(1.0, 2.0), 2),
                tds=round(random.uniform(250, 280), 1), conductivity=round(random.uniform(400, 430), 1),
                temperature=round(random.uniform(26, 28), 1), data_source=DataSource.SIMULATION, quality_status=QualityStatus.VALID
            ))

        # --- North Zone Reservoir (The Story: Normal -> Deterioration -> Alert -> Recovery) ---
        n_ph, n_turb, n_tds, n_cond = 7.2, 2.0, 310.0, 470.0
        if i < 100:
            # Normal
            pass
        elif i < 150:
            # Early deterioration (turbidity and tds rising)
            progress = (i - 100) / 50.0
            n_turb += progress * 2.0
            n_tds += progress * 40.0
        elif i < 200:
            # Alert / Anomaly (all rising, ph shifting)
            progress = (i - 150) / 50.0
            n_turb = 4.0 + progress * 3.0
            n_tds = 350.0 + progress * 60.0
            n_cond = 470.0 + progress * 100.0
            n_ph = 7.2 - progress * 0.4
        else:
            # Recovery
            progress = (i - 200) / 88.0
            n_turb = 7.0 - progress * 4.5
            n_tds = 410.0 - progress * 95.0
            n_cond = 570.0 - progress * 95.0
            n_ph = 6.8 + progress * 0.35

        # Add noise
        n_ph = round(n_ph + random.uniform(-0.05, 0.05), 2)
        n_turb = round(n_turb + random.uniform(-0.2, 0.2), 2)
        n_tds = round(n_tds + random.uniform(-3.0, 3.0), 1)
        n_cond = round(n_cond + random.uniform(-4.0, 4.0), 1)
        n_temp = round(28.0 + random.uniform(-0.5, 0.5), 1)

        readings.append(SensorReading(
            id=str(uuid.uuid4()), source_id="source-north", device_uid="ESP32-WATER-01", captured_at=t,
            ph=n_ph, turbidity=n_turb, tds=n_tds, conductivity=n_cond, temperature=n_temp,
            data_source=DataSource.SIMULATION, quality_status=QualityStatus.VALID
        ))

    db.add_all(readings)
    db.commit()

    print("Generating AI intelligence and risk models for history...")
    from app.ml.risk_engine import risk_engine
    from app.services.alert_service import alert_service

    # Refresh readings to get IDs and evaluate risk in chronological order
    all_readings = db.query(SensorReading).order_by(SensorReading.captured_at.asc()).all()
    for reading in all_readings:
        prediction = risk_engine.evaluate_risk(reading, db)
        alert_service.process_prediction(prediction, db)

    print("Successfully seeded Sources, Devices, History, AI Predictions, and Alerts.")
    db.close()

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    seed_data()
