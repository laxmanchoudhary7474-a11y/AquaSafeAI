from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def health_check():
    return {"status": "ok", "service": "AquaSafeAI", "version": "1.0.0"}
