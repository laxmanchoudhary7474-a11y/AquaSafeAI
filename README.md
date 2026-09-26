# AquaSafeAI

Predict Today. Safer Tomorrow.

AquaSafeAI is an AI-powered early warning platform for water-quality deterioration. Instead of reacting to unsafe water, AquaSafeAI predicts deterioration patterns before they reach critical levels, allowing operators to investigate early.

## Technology Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Recharts, Lucide React
- **Backend**: Python, FastAPI, SQLAlchemy, PostgreSQL, WebSockets
- **AI Engine**: Rolling baseline heuristic multi-parameter anomaly detection
- **Hardware Integration**: Support for ESP32/Arduino via HTTP POST

## Setup Instructions

### 1. Database
AquaSafeAI requires PostgreSQL. A `docker-compose.yml` is provided for easy local setup.
```bash
docker compose up -d
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt # (or install directly via pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic pydantic-settings websockets)

# Copy environment variables
copy .env.example .env

# Seed the initial database (creates the tables and initial Water Source)
python seed.py

# Run the API server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Demo Flow

The system includes a deterministic Demo Simulator that bypasses hardware to inject data directly into the AI pipeline.

To run the Golden Demo:
1. Open the Frontend Dashboard (`http://localhost:5173`).
2. Observe the **Healthy Baseline** (Risk ~0%).
3. Click **Gradual Deterioration** in the Simulation Controls.
4. Watch as the Live Telemetry chart plots rising values.
5. Watch the **AI Deterioration Risk** climb from LOW -> MODERATE -> HIGH -> CRITICAL.
6. Read the **AI Insights** explanation dynamically updating to explain *why* the risk is increasing.
7. Observe the **High Risk Alert** pop up in the active alerts panel.
8. **Acknowledge** the alert.
9. Click **Simulate Recovery** to watch the source stabilize.

## Hardware Integration
An example C++ script for ESP32 is provided in `backend/hardware/esp32_example.cpp`. Ensure your physical device sends a JSON payload to `/api/v1/ingest/readings` matching the contract defined in `IngestPayload`.

## Architecture
- **Ingestion Service**: Validates all incoming hardware and simulation payloads.
- **Risk Engine**: Fetches a 50-reading historical baseline, computes % deviations, generates a 0-100 risk score, and derives an English explanation.
- **Alert Service**: State machine that escalates or deduplicates alerts based on AI predictions.
- **Realtime Service**: FastAPI WebSockets instantly push the newly calculated state to all React clients.
