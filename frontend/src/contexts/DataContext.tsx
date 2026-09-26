import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import type { WaterSource, Alert } from '../types';

interface DataContextType {
  activeSource: WaterSource | null;
  setActiveSource: React.Dispatch<React.SetStateAction<WaterSource | null>>;
  sources: WaterSource[];
  alerts: Alert[];
  readingsHistory: any[];
  latestReading: any;
  latestPrediction: any;
  aiEvents: any[];
  simState: string;
  setSimState: React.Dispatch<React.SetStateAction<string>>;
  simPhase: string;
  simProgress: number;
  acknowledgeAlert: (id: string) => Promise<void>;
  resolveAlert: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { lastMessage } = useWebSocket();
  const [sources, setSources] = useState<WaterSource[]>([]);
  const [activeSource, setActiveSource] = useState<WaterSource | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [readingsHistory, setReadingsHistory] = useState<any[]>([]);
  const [latestReading, setLatestReading] = useState<any>(null);
  const [latestPrediction, setLatestPrediction] = useState<any>(null);
  const [aiEvents, setAiEvents] = useState<any[]>([]);
  const [simState, setSimState] = useState<string>('STOPPED');
  const [simPhase, setSimPhase] = useState<string>('NORMAL');
  const [simProgress, setSimProgress] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const srcRes = await api.getSources();
        setSources(srcRes.data);
        if (srcRes.data.length > 0) {
          const north = srcRes.data.find((s: WaterSource) => s.id === 'source-north');
          setActiveSource(north || srcRes.data[0]);
        }
        
        const altRes = await api.getAlerts();
        setAlerts(altRes.data.filter((a: Alert) => a.status !== 'RESOLVED'));
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchSourceDetails = async () => {
      if (!activeSource) return;
      try {
        const [latestRes, readingsRes, predRes] = await Promise.all([
          api.getLatestReading(activeSource.id).catch(() => null),
          api.getReadings(activeSource.id, 30).catch(() => null),
          api.getLatestPrediction(activeSource.id).catch(() => null)
        ]);

        if (latestRes?.data) setLatestReading(latestRes.data);
        if (predRes?.data) setLatestPrediction(predRes.data);
        if (readingsRes?.data) {
          const formattedHist = readingsRes.data.map((r: any) => ({
            time: new Date(r.captured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            turbidity: r.turbidity,
            tds: r.tds,
            conductivity: r.conductivity,
            ph: r.ph,
            temperature: r.temperature,
            risk: r.risk_score || 0
          })).reverse(); // reverse so oldest is first
          setReadingsHistory(formattedHist);
        }
      } catch (err) {
        console.error("Failed to fetch source details", err);
      }
    };
    fetchSourceDetails();
  }, [activeSource]);

  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'NEW_READING') {
        setSources(prev => prev.map(s => 
          s.id === lastMessage.source_id 
            ? { ...s, safety_score: lastMessage.source?.safety_score || s.safety_score, risk_level: lastMessage.prediction?.risk_level || s.risk_level, trend: lastMessage.source?.trend || s.trend } 
            : s
        ));

        if (activeSource && lastMessage.source_id === activeSource.id) {
          setLatestReading(lastMessage.reading);
          if (lastMessage.prediction) {
            setLatestPrediction(lastMessage.prediction);
          }
          if (lastMessage.source) {
             setActiveSource(prev => prev ? { ...prev, safety_score: lastMessage.source.safety_score, risk_level: lastMessage.prediction?.risk_level, trend: lastMessage.source.trend } : null);
          }
          
          setReadingsHistory(prev => {
            const newHist = [...prev, {
              time: new Date(lastMessage.reading.captured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              turbidity: lastMessage.reading.turbidity,
              tds: lastMessage.reading.tds,
              conductivity: lastMessage.reading.conductivity,
              ph: lastMessage.reading.ph,
              temperature: lastMessage.reading.temperature,
              risk: lastMessage.prediction ? lastMessage.prediction.risk_score : 0
            }];
            if (newHist.length > 30) newHist.shift(); // Keep last 30
            return newHist;
          });

          if (lastMessage.new_alert) {
            api.getAlerts().then(res => setAlerts(res.data.filter((a: Alert) => a.status !== 'RESOLVED')));
          }
        }
      } else if (lastMessage.type === 'AI_EVENT') {
        if (activeSource && lastMessage.source_id === activeSource.id) {
            setAiEvents(prev => {
                const newEvents = [...prev, lastMessage];
                if (newEvents.length > 10) newEvents.shift();
                return newEvents;
            });
        }
      } else if (lastMessage.type === 'SIMULATION_STATE') {
         if (activeSource && lastMessage.source_id === activeSource.id) {
            setSimState(lastMessage.state.scenario);
            setSimPhase(lastMessage.state.phase);
            setSimProgress(lastMessage.state.progress);
         }
      }
    }
  }, [lastMessage, activeSource]);

  const acknowledgeAlert = async (id: string) => {
    try {
        await api.acknowledgeAlert(id);
        const res = await api.getAlerts();
        setAlerts(res.data.filter((a: Alert) => a.status !== 'RESOLVED'));
    } catch (e) { console.error(e) }
  };
  
  const resolveAlert = async (id: string) => {
    try {
        setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (e) { console.error(e) }
  };

  return (
    <DataContext.Provider value={{
      activeSource, setActiveSource, sources, alerts, readingsHistory, latestReading,
      latestPrediction, aiEvents, simState, setSimState, simPhase, simProgress, acknowledgeAlert, resolveAlert
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
