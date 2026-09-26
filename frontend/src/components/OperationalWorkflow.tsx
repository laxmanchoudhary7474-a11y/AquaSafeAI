
import { useData } from '../contexts/DataContext';
import { ArrowRight, Database, Server, ShieldAlert, Cpu, Activity, AlertTriangle } from 'lucide-react';

const OperationalWorkflow = () => {
  const { latestPrediction, aiEvents } = useData();

  // Active state logic
  const isAnomaly = latestPrediction?.risk_score > 25;
  const isAlert = latestPrediction?.risk_score > 75;
  
  // Highlight stages based on recent AI Events
  const recentEvent = aiEvents.length > 0 ? aiEvents[aiEvents.length - 1].message : "";
  const detectingAnomaly = recentEvent.includes("deviation") || recentEvent.includes("pattern") || recentEvent.includes("abnormality");

  const stages = [
    { id: 1, name: "SENSOR DATA", icon: Server, active: true, desc: "IoT Ingestion" },
    { id: 2, name: "DATA QUALITY", icon: Database, active: true, desc: "Validation" },
    { id: 3, name: "BASELINE", icon: Activity, active: true, desc: "Historical Compare" },
    { id: 4, name: "ANOMALY", icon: Cpu, active: isAnomaly || detectingAnomaly, desc: "Feature Engine", color: isAnomaly || detectingAnomaly ? 'text-amber-500 bg-amber-50 border-amber-200' : '' },
    { id: 5, name: "RISK", icon: ShieldAlert, active: isAnomaly || detectingAnomaly, desc: "Scoring Model", color: isAnomaly || detectingAnomaly ? 'text-amber-500 bg-amber-50 border-amber-200' : '' },
    { id: 6, name: "EXPLANATION", icon: Cpu, active: isAnomaly, desc: "Explainable AI", color: isAnomaly ? 'text-indigo-500 bg-indigo-50 border-indigo-200' : '' },
    { id: 7, name: "ALERT", icon: AlertTriangle, active: isAlert, desc: "Rule Engine", color: isAlert ? 'text-rose-500 bg-rose-50 border-rose-200' : '' },
    { id: 8, name: "ACTION", icon: Activity, active: isAlert, desc: "Operator Response", color: isAlert ? 'text-rose-500 bg-rose-50 border-rose-200 animate-pulse' : '' },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Live Operational Workflow</h3>
        <div className="flex flex-wrap items-center justify-between gap-y-6">
            {stages.map((stage, i) => (
                <div key={stage.id} className="flex items-center">
                    <div className={`flex flex-col items-center justify-center w-24 h-24 rounded-xl border-2 transition-all ${stage.active ? (stage.color || 'border-teal-500 bg-teal-50 text-teal-600') : 'border-slate-200 bg-slate-50 text-slate-400 opacity-50'}`}>
                        <stage.icon size={24} className="mb-2" />
                        <span className="text-[10px] font-bold text-center leading-tight">{stage.name}</span>
                        <span className="text-[8px] text-slate-400 mt-1 uppercase text-center px-1">{stage.desc}</span>
                    </div>
                    {i < stages.length - 1 && (
                        <div className={`mx-2 flex-1 flex justify-center ${stage.active && stages[i+1].active ? 'text-teal-500' : 'text-slate-200'}`}>
                            <ArrowRight size={20} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
  );
};

export default OperationalWorkflow;
