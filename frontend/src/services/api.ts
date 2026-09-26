import axios from 'axios';
import type { WaterSource, Alert } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_V1 = `${API_BASE_URL}/api/v1`;

export const api = {
  // Sources
  getSources: () => axios.get<WaterSource[]>(`${API_V1}/sources`),
  createSource: (data: { name: string; location?: string }) => axios.post<WaterSource>(`${API_V1}/sources`, data),
  getLatestReading: (sourceId: string) => axios.get(`${API_V1}/sources/${sourceId}/latest`),
  getReadings: (sourceId: string, limit: number = 50) => axios.get(`${API_V1}/sources/${sourceId}/readings?limit=${limit}`),
  getLatestPrediction: (sourceId: string) => axios.get(`${API_V1}/sources/${sourceId}/prediction`),
  
  // Alerts
  getAlerts: () => axios.get<Alert[]>(`${API_V1}/alerts`),
  acknowledgeAlert: (alertId: string) => axios.post<Alert>(`${API_V1}/alerts/${alertId}/acknowledge`, { user_id: 'operator_1' }),
  resolveAlert: (alertId: string) => axios.post<Alert>(`${API_V1}/alerts/${alertId}/resolve`, { user_id: 'operator_1', resolution_note: 'Checked' }),

  // Simulation
  startSimulation: (sourceId: string, scenario: string) => axios.post(`${API_V1}/simulation/start`, { source_id: sourceId, scenario }),
  stopSimulation: (sourceId: string) => axios.post(`${API_V1}/simulation/stop`, { source_id: sourceId }),
};
