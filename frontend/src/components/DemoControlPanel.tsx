import { useData } from '../contexts/DataContext';
import { api } from '../services/api';

const DemoControlPanel = () => {
  const { activeSource, simState, setSimState } = useData();

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

  const handleAutoDemo = async () => {
    if (!activeSource) return;
    try {
      await api.startSimulation(activeSource.id, 'MULTI_PARAMETER_DETERIORATION');
      setSimState('AUTO_DEMO');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Demo Control Center</h3>
        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold tracking-wider uppercase">
            {simState !== 'STOPPED' ? (simState === 'AUTO_DEMO' ? 'AUTO DEMO ACTIVE' : 'SIMULATION ACTIVE') : 'LIVE DEVICE MODE'}
        </span>
        </div>
        
        <div className="flex flex-wrap gap-3">
        <button onClick={() => handleSimulate('NORMAL')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${simState==='NORMAL' ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            Healthy Baseline
        </button>
        <button onClick={() => handleSimulate('MULTI_PARAMETER_DETERIORATION')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${simState==='MULTI_PARAMETER_DETERIORATION' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            Multi-Parameter Deterioration
        </button>
        <button onClick={() => handleSimulate('TURBIDITY_SPIKE')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${simState==='TURBIDITY_SPIKE' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            Turbidity Spike
        </button>
        <button onClick={() => handleSimulate('DATA_QUALITY_SPIKE')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${simState==='DATA_QUALITY_SPIKE' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            Data Quality Spike
        </button>
        <button onClick={() => handleSimulate('RECOVERY')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${simState==='RECOVERY' ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            Trigger Recovery
        </button>
        
        <div className="flex-1 min-w-[200px] flex justify-end gap-3 border-l border-slate-200 pl-4 ml-2">
            <button onClick={handleAutoDemo} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${simState === 'AUTO_DEMO' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}>
                Run 90-Second Demo
            </button>
            <button onClick={() => handleSimulate('STOP')} className="px-4 py-2 rounded-lg text-sm font-medium bg-rose-100 text-rose-700 hover:bg-rose-200">
                Stop
            </button>
        </div>
        </div>
        <p className="text-xs text-slate-400 mt-4">
        Simulation data uses the same ingestion, validation, and intelligence pipeline as physical ESP32/Arduino devices.
        </p>
    </div>
  );
};

export default DemoControlPanel;
