import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { Activity, Droplet, Thermometer, Waves, AlertTriangle } from 'lucide-react';
import DemoControlPanel from '../components/DemoControlPanel';
import RiskTrajectoryChart from '../components/RiskTrajectoryChart';
import WhatAISees from '../components/WhatAISees';
import OperationalWorkflow from '../components/OperationalWorkflow';

const Overview = () => {
  const { activeSource, latestPrediction, latestReading, alerts, simState, simPhase, simProgress } = useData();
  const { isConnected } = useWebSocket();
  const [showDebug, setShowDebug] = useState(false);

  if (!activeSource) {
    return <div className="p-8 text-center text-slate-500">Loading operations...</div>;
  }

  const getMetrics = (param: string) => {
    if (!latestPrediction?.factors) return null;
    const factor = latestPrediction.factors.find((f: any) => f.parameter === param);
    if (!factor || factor.baseline === undefined) return null;
    return {
        baseline: factor.baseline,
        dev: factor.relative_change
    };
  };

  return (
    <div className="space-y-6">
      {/* DEVELOPMENT DEBUG PANEL */}
      <div className="mb-4">
          <button 
              onClick={() => setShowDebug(!showDebug)} 
              className="text-xs font-mono text-slate-500 hover:text-indigo-600 bg-slate-100 px-3 py-1 rounded"
          >
              {showDebug ? '[-] Hide Debug Panel' : '[+] Show Debug Panel'}
          </button>
          
          {showDebug && (
              <div className="mt-2 p-4 bg-slate-900 text-slate-300 font-mono text-xs rounded-xl shadow-inner space-y-2">
                  <div className="flex justify-between border-b border-slate-700 pb-2">
                      <span className="text-indigo-400 font-bold">AQUASAFEAI SYSTEM STATE</span>
                      <span className={isConnected ? 'text-teal-400' : 'text-rose-400'}>
                          WS: {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                      </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <div className="text-slate-500">SIMULATION</div>
                          <div>Scenario: <span className="text-white">{simState}</span></div>
                          <div>Phase: <span className="text-white">{simPhase}</span></div>
                          <div>Progress: <span className="text-white">{simProgress}%</span></div>
                      </div>
                      <div>
                          <div className="text-slate-500">RISK ENGINE</div>
                          <div>Score: <span className="text-white">{latestPrediction?.risk_score?.toFixed(1) || '--'}</span></div>
                          <div>Anomaly: <span className="text-white">{latestPrediction?.anomaly_score?.toFixed(1) || '--'}</span></div>
                          <div>Alerts: <span className="text-white">{alerts.length} Active</span></div>
                      </div>
                  </div>
                  <div className="border-t border-slate-700 pt-2 mt-2">
                      <div className="text-slate-500">LATEST READING PAYLOAD</div>
                      <pre className="text-emerald-400 mt-1 max-h-32 overflow-auto">
                          {JSON.stringify(latestReading, null, 2)}
                      </pre>
                  </div>
              </div>
          )}
      </div>

      {/* Demo Status Bar */}
      {simState !== 'STOPPED' && (
        <div className="bg-indigo-600 text-white rounded-xl p-3 flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-4">
                <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold tracking-wider">SIMULATION MODE</span>
                <span className="text-sm font-medium">Scenario: <span className="font-bold">{simState}</span></span>
                <span className="text-sm font-medium">Phase: <span className="font-bold">{simPhase}</span></span>
            </div>
            <div className="flex items-center space-x-3">
                <div className="w-32 bg-indigo-900 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: `${simProgress}%` }}></div>
                </div>
                <span className="text-xs font-bold">{simProgress}%</span>
            </div>
        </div>
      )}

      {/* Quality Warning Banner */}
      {latestReading?.quality_status === 'SUSPECT' && (
        <div className="bg-orange-100 border border-orange-200 text-orange-800 rounded-xl p-4 flex items-center shadow-sm">
            <div className="bg-orange-500 text-white p-1.5 rounded-full mr-3">
                <AlertTriangle size={16} />
            </div>
            <div>
                <h4 className="font-bold text-sm">QUALITY WARNING</h4>
                <p className="text-xs">Potential sensor spike detected. Reading ingested as SUSPECT.</p>
            </div>
        </div>
      )}

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Water Safety Score" value={`${activeSource.safety_score.toFixed(0)}/100`} trend={activeSource.trend} color={activeSource.safety_score < 50 ? 'text-rose-500' : 'text-teal-500'} />
        <KPICard title="AI Risk Estimate" value={`${latestPrediction?.risk_score ? latestPrediction.risk_score.toFixed(1) : '--'}`} suffix="/100" trend={latestPrediction?.risk_level || activeSource.risk_level} color={(latestPrediction?.risk_score ?? 0) > 50 ? 'text-amber-500' : 'text-slate-800'} />
        <KPICard title="Active Alerts" value={alerts.length.toString()} trend={alerts.length > 0 ? "Action Required" : "All Clear"} color={alerts.length > 0 ? 'text-rose-500' : 'text-teal-500'} />
        <div className="bg-slate-900 p-5 rounded-2xl flex flex-col justify-center border border-slate-800">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Selected Source</h3>
            <div className="text-lg font-bold text-white leading-tight">{activeSource.name}</div>
            <div className="text-xs text-indigo-400 mt-2">ID: {activeSource.id}</div>
        </div>
      </div>

      {/* Live Telemetry Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <SensorCard title="Turbidity" value={latestReading?.turbidity} unit="NTU" icon={Waves} color="text-cyan-500" metrics={getMetrics('turbidity')} />
        <SensorCard title="TDS" value={latestReading?.tds} unit="ppm" icon={Droplet} color="text-amber-500" metrics={getMetrics('tds')} />
        <SensorCard title="Conductivity" value={latestReading?.conductivity} unit="µS/cm" icon={Activity} color="text-purple-500" metrics={getMetrics('conductivity')} />
        <SensorCard title="pH Level" value={latestReading?.ph} unit="" icon={Droplet} color="text-emerald-500" metrics={getMetrics('ph')} />
        <SensorCard title="Temperature" value={latestReading?.temperature} unit="°C" icon={Thermometer} color="text-orange-500" metrics={getMetrics('temperature')} />
      </div>

      {/* Intelligence & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <RiskTrajectoryChart />
        </div>
        <div>
            <WhatAISees />
        </div>
      </div>

      {/* Demo Controls */}
      <DemoControlPanel />
    </div>
  );
};

const KPICard = ({ title, value, suffix = "", trend, color }: any) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</h3>
    <div className={`text-4xl font-bold ${color}`}>
        {value}<span className="text-xl text-slate-400 ml-1">{suffix}</span>
    </div>
    <div className="mt-3 text-xs font-medium text-slate-500">
      {trend}
    </div>
  </div>
);

const SensorCard = ({ title, value, unit, icon: Icon, color, metrics }: any) => {
    const isUp = metrics?.dev > 0;
    const isDown = metrics?.dev < 0;
    const devText = metrics?.dev ? `${isUp ? '+' : ''}${metrics.dev.toFixed(1)}%` : '--';
    
    return (
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between space-x-3">
            <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg bg-slate-50 ${color}`}>
                <Icon size={18} />
                </div>
                <div>
                <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{title}</h4>
                <div className="text-sm font-bold text-slate-800 flex items-center space-x-1">
                    <span>{value !== undefined ? value : '--'}</span> <span className="text-xs font-normal text-slate-500">{unit}</span>
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5 flex items-center space-x-1">
                    {metrics?.baseline ? <span>Baseline: {metrics.baseline.toFixed(1)}</span> : <span>SIMULATION</span>}
                </div>
                </div>
            </div>
            {metrics?.dev !== undefined && Math.abs(metrics.dev) > 1.0 && (
                <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center ${isUp ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                    {devText}
                </div>
            )}
        </div>
    );
};

export default Overview;
