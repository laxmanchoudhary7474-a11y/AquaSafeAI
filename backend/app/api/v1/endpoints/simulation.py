from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.models.source import WaterSource
from app.simulation.scenarios import SimulationScenario
from app.services.simulation_service import simulation_manager

router = APIRouter()

class SimulationStartRequest(BaseModel):
    source_id: str
    scenario: SimulationScenario

class SimulationStopRequest(BaseModel):
    source_id: str

@router.post("/start")
def start_simulation(request: SimulationStartRequest, db: Session = Depends(get_db)):
    source = db.query(WaterSource).filter(WaterSource.id == request.source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="WaterSource not found")
        
    simulation_manager.start_simulation(request.source_id, request.scenario)
    return {"message": f"Simulation {request.scenario} started for source {request.source_id}"}

@router.post("/stop")
def stop_simulation(request: SimulationStopRequest):
    simulation_manager.stop_simulation(request.source_id)
    return {"message": f"Simulation stopped for source {request.source_id}"}
