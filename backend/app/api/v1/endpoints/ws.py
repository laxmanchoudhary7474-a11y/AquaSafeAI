from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.realtime_service import realtime_manager

router = APIRouter()

@router.websocket("/live")
async def websocket_endpoint(websocket: WebSocket):
    await realtime_manager.connect(websocket)
    try:
        while True:
            # We don't expect messages from the client right now, but keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        realtime_manager.disconnect(websocket)
