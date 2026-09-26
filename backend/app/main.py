from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
from app.db.session import engine, Base, SessionLocal
from app.db.base import WaterSource, Device, SensorReading, Prediction, RiskFactor, Alert, AlertEvent, User, ModelVersion, AuditLog
import seed

Base.metadata.create_all(bind=engine)

# Auto-seed demo data if empty
db = SessionLocal()
try:
    if db.query(WaterSource).count() == 0:
        seed.seed_database()
finally:
    db.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "Welcome to AquaSafeAI API. Go to /docs for Swagger UI."}
