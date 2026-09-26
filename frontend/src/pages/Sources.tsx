import { useData } from '../contexts/DataContext';

const Sources = () => {
  const { sources, setActiveSource, activeSource, latestReading, latestPrediction, alerts } = useData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Water Sources</h1>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
            Add Source
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sources.map(source => {
          const isActive = activeSource?.id === source.id;
          return (
          <div 
            key={source.id} 
            onClick={() => setActiveSource(source)}
            className={`bg-white p-6 rounded-2xl border ${isActive ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-slate-300'} shadow-sm cursor-pointer transition-all flex flex-col`}
          >
            <div className="flex justify-between items-center">
                <div>
                <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-slate-800">{source.name}</h3>
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${source.risk_level === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : source.risk_level === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'}`}>
                        {source.risk_level}
                    </span>
                </div>
                <p className="text-sm text-slate-500">Location: {source.location} | ID: {source.id}</p>
                </div>
                <div className="text-right">
                    <div className="text-sm text-slate-500 mb-1">Safety Score</div>
                    <div className={`text-2xl font-bold ${source.safety_score < 50 ? 'text-rose-500' : 'text-teal-500'}`}>
                        {source.safety_score.toFixed(1)}
                    </div>
                </div>
            </div>

            {isActive && (
                <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">Current Risk</div>
                        <div className="font-bold text-slate-800">{latestPrediction?.risk_score?.toFixed(1) || '--'}</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">Turbidity</div>
                        <div className="font-bold text-slate-800">{latestReading?.turbidity || '--'} NTU</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">TDS</div>
                        <div className="font-bold text-slate-800">{latestReading?.tds || '--'} ppm</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">Active Alerts</div>
                        <div className={`font-bold ${alerts.length > 0 ? 'text-rose-600' : 'text-slate-800'}`}>{alerts.length}</div>
                    </div>
                    <div className="col-span-2 md:col-span-4 mt-2">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">AI Explanation</div>
                        <div className="text-sm text-indigo-700 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                            {latestPrediction?.explanation || 'Waiting for inference...'}
                        </div>
                    </div>
                </div>
            )}
          </div>
        )})}
      </div>
    </div>
  );
};

export default Sources;
