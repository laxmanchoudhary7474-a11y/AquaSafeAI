from fastapi import APIRouter
from app.api.v1.endpoints import health, sources, devices, ingest, simulation, ws, alerts

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(sources.router, prefix="/sources", tags=["sources"])
api_router.include_router(devices.router, prefix="/devices", tags=["devices"])
api_router.include_router(ingest.router, prefix="/ingest", tags=["ingest"])
api_router.include_router(simulation.router, prefix="/simulation", tags=["simulation"])
api_router.include_router(ws.router, prefix="/ws", tags=["ws"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
