import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Droplet, Thermometer, Waves } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import type { WaterSource, Alert } from '../types';

const Dashboard = ({ wsMessage }: { wsMessage: any }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeSource, setActiveSource] = useState<WaterSource | null>(null);
  const [readingsHistory, setReadingsHistory] = useState<any[]>([]);
  const [latestReading, setLatestReading] = useState<any>(null);
  const [latestPrediction, setLatestPrediction] = useState<any>(null);
  
  // Simulation Controls
  const [simState, setSimState] = useState<string>('STOPPED');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const srcRes = await api.getSources();
        if (srcRes.data.length > 0) {
          setActiveSource(srcRes.data[0]);
        } else {
          enableOfflineMock();
        }
        
        const altRes = await api.getAlerts();
        setAlerts(altRes.data.filter(a => a.status !== 'RESOLVED'));
      } catch (err) {
        console.error("Failed to fetch initial data", err);
        enableOfflineMock();
      }
    };
    fetchData();
  }, []);

  const enableOfflineMock = () => {
    setActiveSource({
      id: "mock-1",
      name: "Sector 4 Treatment Plant (Offline Preview)",
      location: "Sector 4",
      safety_score: 87.5,
      risk_level: "LOW",
      trend: "STABLE",
      last_update: new Date().toISOString()
    } as any);
    setLatestReading({
      turbidity: 2.4,
      tds: 310,
      conductivity: 480,
      ph: 7.1,
      temperature: 28.5
    });
    setLatestPrediction({
      risk_score: 12.5,
      risk_level: "LOW",
      explanation: "Offline Preview: Water quality is stable and within normal baseline parameters. (Start the backend to see live data)."
    });
    setReadingsHistory([
      { time: "10:00:00", turbidity: 2.3, tds: 305, risk: 10 },
      { time: "10:05:00", turbidity: 2.4, tds: 308, risk: 11 },
      { time: "10:10:00", turbidity: 2.4, tds: 310, risk: 12.5 },
    ]);
  };

  useEffect(() => {
    if (wsMessage && wsMessage.type === 'NEW_READING') {
      if (activeSource && wsMessage.source_id === activeSource.id) {
        setLatestReading(wsMessage.reading);
        if (wsMessage.prediction) {
          setLatestPrediction(wsMessage.prediction);
        }
        if (wsMessage.source) {
           setActiveSource(prev => prev ? { ...prev, safety_score: wsMessage.source.safety_score, risk_level: wsMessage.prediction?.risk_level, trend: wsMessage.source.trend } : null);
        }
        
        // Update Chart
        setReadingsHistory(prev => {
          const newHist = [...prev, {
            time: new Date(wsMessage.reading.captured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            turbidity: wsMessage.reading.turbidity,
            tds: wsMessage.reading.tds,
            risk: wsMessage.prediction ? wsMessage.prediction.risk_score : 0
          }];
          if (newHist.length > 20) newHist.shift(); // Keep last 20
          return newHist;
        });

        if (wsMessage.new_alert) {
          // Fetch alerts again or just append
          api.getAlerts().then(res => setAlerts(res.data.filter(a => a.status !== 'RESOLVED')));
        }
      }
    }
  }, [wsMessage, activeSource]);

  const handleSimulate = async (scenario: string) => {
    if (!activeSource) return;
    try {
      if (scenario === 'STOP') {
        await api.stopSimulation(activeSource.id);
        setSimState('STOPPED');
      } else {
        await api.startSimulation(activeSource.id, scenario);
        setSimState(scenario);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const acknowledgeAlert = async (id: string) => {
    await api.acknowledgeAlert(id);
    const res = await api.getAlerts();
    setAlerts(res.data.filter(a => a.status !== 'RESOLVED'));
  };

  if (!activeSource) {
    return <div className="text-center mt-20 text-slate-500 flex flex-col items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mb-4"></div>
      Loading Water Intelligence...
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Droplet size={80} /></div>
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Water Safety Score</h3>
            <div className={`text-5xl font-bold mt-2 ${activeSource.safety_score < 50 ? 'text-rose-500' : 'text-teal-500'}`}>
              {activeSource.safety_score.toFixed(0)}<span className="text-2xl text-slate-400">/100</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-slate-500">
            Trend: <strong className="ml-1 text-slate-700">{activeSource.trend}</strong>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Activity size={80} /></div>
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">AI Deterioration Risk</h3>
            <div className={`text-5xl font-bold mt-2 ${latestPrediction?.risk_score > 50 ? 'text-amber-500' : 'text-slate-800'}`}>
              {latestPrediction?.risk_score ? latestPrediction.risk_score.toFixed(1) : '--'}%
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-slate-500">
            Level: <strong className="ml-1 text-slate-700">{latestPrediction?.risk_level || activeSource.risk_level}</strong>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between text-white">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">AI Insights</h3>
            <p className="mt-3 text-slate-200 leading-relaxed text-sm">
              {latestPrediction?.explanation || "Awaiting sensor data to calculate baseline and evaluate multi-parameter risk."}
            </p>
          </div>
          {alerts.length > 0 && (
            <div className="mt-4 px-3 py-2 bg-rose-500/20 text-rose-300 rounded-lg text-sm flex items-center">
              <AlertTriangle size={16} className="mr-2" />
              {alerts.length} Active Alert{alerts.length > 1 ? 's' : ''} Require Attention
            </div>
          )}
        </div>
      </div>

      {/* Sensor Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <SensorCard title="Turbidity" value={latestReading?.turbidity} unit="NTU" icon={Waves} color="text-cyan-500" />
        <SensorCard title="TDS" value={latestReading?.tds} unit="ppm" icon={Droplet} color="text-amber-500" />
        <SensorCard title="Conductivity" value={latestReading?.conductivity} unit="µS/cm" icon={Activity} color="text-purple-500" />
        <SensorCard title="pH Level" value={latestReading?.ph} unit="" icon={Droplet} color="text-emerald-500" />
        <SensorCard title="Temperature" value={latestReading?.temperature} unit="°C" icon={Thermometer} color="text-orange-500" />
      </div>

      {/* Charts & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Live Telemetry & Risk Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={readingsHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" tick={{fontSize: 12, fill: '#64748b'}} tickMargin={10} />
                <YAxis yAxisId="left" tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis yAxisId="right" orientation="right" tick={{fontSize: 12, fill: '#64748b'}} domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line yAxisId="left" type="monotone" dataKey="turbidity" stroke="#06b6d4" strokeWidth={2} dot={false} name="Turbidity" />
                <Line yAxisId="left" type="monotone" dataKey="tds" stroke="#f59e0b" strokeWidth={2} dot={false} name="TDS" />
                <Line yAxisId="right" type="monotone" dataKey="risk" stroke="#f43f5e" strokeWidth={2} dot={false} name="Risk Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Active Alerts</h3>
          <div className="flex-1 overflow-y-auto space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center text-slate-400 mt-10 text-sm">No active alerts. Source is safe.</div>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} className="p-4 rounded-xl border border-rose-100 bg-rose-50/50">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-rose-700 text-sm">{alert.title}</h4>
                    <span className="text-xs px-2 py-1 bg-rose-100 text-rose-700 rounded-full font-medium">
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs text-rose-600/80 mt-1">{alert.message}</p>
                  <button 
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="mt-3 text-xs bg-white border border-rose-200 text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors w-full font-medium"
                  >
                    Acknowledge
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Demo Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
         <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Demo Simulation Controls</h3>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold tracking-wider">
              {simState !== 'STOPPED' ? 'SIMULATION ACTIVE' : 'LIVE DEVICE MODE'}
            </span>
         </div>
         <div className="flex flex-wrap gap-3">
            <button onClick={() => handleSimulate('NORMAL')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${simState==='NORMAL' ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              Healthy Baseline
            </button>
            <button onClick={() => handleSimulate('MULTI_PARAMETER_DETERIORATION')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${simState==='MULTI_PARAMETER_DETERIORATION' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              Gradual Deterioration
            </button>
            <button onClick={() => handleSimulate('TURBIDITY_SPIKE')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${simState==='TURBIDITY_SPIKE' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              Turbidity Spike
            </button>
            <button onClick={() => handleSimulate('RECOVERY')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${simState==='RECOVERY' ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              Simulate Recovery
            </button>
            <button onClick={() => handleSimulate('STOP')} className="px-4 py-2 rounded-lg text-sm font-medium bg-rose-100 text-rose-700 hover:bg-rose-200 ml-auto">
              Stop Simulator
            </button>
         </div>
         <p className="text-xs text-slate-400 mt-4">
           Use these controls to override physical hardware and inject synthetic data into the ingestion pipeline for demonstration purposes.
         </p>
      </div>

    </div>
  );
};

const SensorCard = ({ title, value, unit, icon: Icon, color }: any) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
    <div className={`p-3 rounded-lg bg-slate-50 ${color}`}>
      <Icon size={20} />
    </div>
    <div>
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</h4>
      <div className="text-lg font-bold text-slate-800">
        {value !== undefined ? value : '--'} <span className="text-sm font-normal text-slate-500">{unit}</span>
      </div>
    </div>
  </div>
);

export default Dashboard;
