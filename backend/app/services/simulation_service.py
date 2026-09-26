import asyncio
import uuid
import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.db.session import SessionLocal

from app.simulation.scenarios import SimulationScenario, BaseWaterProfile, get_next_reading
from app.schemas.reading import IngestPayload, SensorData
from app.models.reading import DataSource
from app.services.ingestion_service import ingestion_service
from app.services.realtime_service import realtime_manager

logger = logging.getLogger(__name__)

class SimulationManager:
    def __init__(self):
        self.active_simulations = {} # source_id -> task

    async def _run_simulation(self, source_id: str, scenario: SimulationScenario):
        logger.info(f"Starting simulation {scenario} for source {source_id}")
        profile = BaseWaterProfile()
        step = 0
        device_uid = f"SIM-DEV-{source_id[:4].upper()}"
        last_phase = None

        phase_messages = {
            "EARLY_CHANGE": "TDS and turbidity deviations detected",
            "CROSS_PARAMETER": "Cross-parameter trend detected (conductivity/pH shift)",
            "ANOMALY": "Sustained multi-parameter abnormality identified",
            "HIGH_RISK": "Risk escalating. Early warning conditions met.",
            "CRITICAL": "Critical threshold exceeded. Alert triggered.",
            "RECOVERY": "Parameters returning towards normal baseline."
        }

        try:
            while True:
                if scenario == SimulationScenario.DEVICE_OFFLINE:
                    await asyncio.sleep(5) # Do nothing
                    continue

                readings_dict, phase_name, progress = get_next_reading(profile, scenario, step)
                
                # Emit AI reasoning event if phase changed
                if phase_name != last_phase and phase_name in phase_messages:
                    await realtime_manager.broadcast({
                        "type": "AI_EVENT",
                        "source_id": source_id,
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "message": phase_messages[phase_name]
                    })
                    last_phase = phase_name
                elif last_phase is None and phase_name == "NORMAL":
                    last_phase = "NORMAL"
                    await realtime_manager.broadcast({
                        "type": "AI_EVENT",
                        "source_id": source_id,
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "message": "Monitoring normal baseline"
                    })
                elif phase_name == "TURBIDITY_SPIKE":
                    if step % 10 == 0:
                        await realtime_manager.broadcast({
                            "type": "AI_EVENT",
                            "source_id": source_id,
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                            "message": "Turbidity has increased sharply while the other monitored parameters remain relatively stable."
                        })
                elif phase_name == "RECOVERY":
                    if step % 5 == 0:
                         await realtime_manager.broadcast({
                            "type": "AI_EVENT",
                            "source_id": source_id,
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                            "message": "Risk is decreasing as sensor readings move back toward the source baseline."
                        })

                # Broadcast Simulation Demo State for the UI
                await realtime_manager.broadcast({
                    "type": "SIMULATION_STATE",
                    "source_id": source_id,
                    "state": {
                        "scenario": scenario.value,
                        "phase": phase_name,
                        "progress": progress
                    }
                })

                payload = IngestPayload(
                    event_id=str(uuid.uuid4()),
                    device_uid=device_uid,
                    source_id=source_id,
                    timestamp=datetime.now(timezone.utc),
                    data_source=DataSource.SIMULATION,
                    readings=SensorData(**readings_dict)
                )

                # Use a fresh DB session for each injection
                with SessionLocal() as db:
                    try:
                        # Ingestion service will eventually broadcast telemetry and risk updates
                        ingestion_service.process_reading(payload, db)
                        logger.info(f"Simulated reading ingested for {source_id}")
                    except Exception as e:
                        logger.error(f"Failed to ingest simulated reading: {e}")

                step += 1
                await asyncio.sleep(2) # Emit every 2 seconds for demo speed

        except asyncio.CancelledError:
            logger.info(f"Simulation {scenario} for source {source_id} cancelled.")

    def start_simulation(self, source_id: str, scenario: SimulationScenario):
        if source_id in self.active_simulations:
            self.stop_simulation(source_id)

        task = asyncio.create_task(self._run_simulation(source_id, scenario))
        self.active_simulations[source_id] = task

    def stop_simulation(self, source_id: str):
        if source_id in self.active_simulations:
            self.active_simulations[source_id].cancel()
            del self.active_simulations[source_id]

simulation_manager = SimulationManager()
