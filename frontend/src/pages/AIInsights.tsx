import AIEventStream from '../components/AIEventStream';
import WhatAISees from '../components/WhatAISees';
import RiskTrajectoryChart from '../components/RiskTrajectoryChart';
import { useData } from '../contexts/DataContext';

const AIInsights = () => {
  const { latestPrediction } = useData();
  const factors = latestPrediction?.factors || [];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">AI Intelligence Center</h1>
        <p className="text-sm text-slate-500 mt-1">Prototype Explainable Inference Engine</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <RiskTrajectoryChart />
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Why Did Risk Increase?</h3>
                {factors.length === 0 ? (
                    <div className="text-slate-500">No significant factors contributing to risk.</div>
                ) : (
                    <div className="space-y-3">
                        {factors.map((f: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                                <div>
                                    <span className="font-bold text-slate-700 uppercase mr-3">{f.parameter}</span>
                                    <span className={`font-medium ${f.direction === 'UP' ? 'text-amber-500' : 'text-indigo-500'}`}>
                                        {f.direction === 'UP' ? '+' : ''}{f.relative_change.toFixed(1)}%
                                    </span>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase ${f.contribution > 20 ? 'bg-rose-100 text-rose-700' : f.contribution > 5 ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'}`}>
                                    {f.contribution > 20 ? 'High Contribution' : f.contribution > 5 ? 'Medium Contribution' : 'Emerging'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
        <div className="space-y-6 flex flex-col">
            <div className="h-64">
                <WhatAISees />
            </div>
            <div className="flex-1 min-h-[300px]">
                <AIEventStream />
            </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
