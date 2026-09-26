export interface WaterSource {
  id: string;
  name: string;
  location: string;
  safety_score: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  trend: 'STABLE' | 'RISING' | 'FALLING';
  last_update: string;
}

export interface SensorReading {
  id: string;
  captured_at: string;
  ph: number;
  turbidity: number;
  tds: number;
  conductivity: number;
  temperature: number;
  quality_status: 'VALID' | 'WARNING' | 'INVALID' | 'STALE';
}

export interface Prediction {
  risk_score: number;
  risk_level: string;
  explanation: string;
}

export interface Alert {
  id: string;
  source_id: string;
  alert_type: string;
  severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  why_it_happened: string;
  status: 'NEW' | 'ACKNOWLEDGED' | 'RESOLVED';
  created_at: string;
}
