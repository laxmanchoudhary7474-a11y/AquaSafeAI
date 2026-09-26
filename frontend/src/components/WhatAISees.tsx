import { useData } from '../contexts/DataContext';
import { Activity, AlertTriangle, ArrowDown, ArrowUp, Minus } from 'lucide-react';

const WhatAISees = () => {
  const { latestPrediction, activeSource } = useData();

  if (!latestPrediction || !activeSource) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center text-slate-500 py-12">
        Waiting for AI inference data...
      </div>
    );
  }

  const factors = latestPrediction.factors || [];

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm h-full flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5"><Activity size={100} /></div>
        <h3 className="text-lg font-semibold text-slate-100 mb-6 flex items-center">
            <span className="bg-indigo-500 w-2 h-6 rounded-full mr-3"></span>
            WHAT THE AI SEES
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-6 z-10">
            {['turbidity', 'tds', 'conductivity', 'ph'].map(param => {
                const factor = factors.find((f: any) => f.parameter === param);
                const hasFactor = !!factor;
                
                let Icon = Minus;
                let colorClass = 'text-slate-400';
                let bgClass = 'bg-slate-800';
                
                if (hasFactor) {
                    Icon = factor.direction === 'UP' ? ArrowUp : ArrowDown;
                    if (factor.contribution > 20) {
                        colorClass = 'text-rose-400';
                        bgClass = 'bg-rose-900/30 border-rose-500/30';
                    } else if (factor.contribution > 5) {
                        colorClass = 'text-amber-400';
                        bgClass = 'bg-amber-900/30 border-amber-500/30';
                    } else {
                        colorClass = 'text-indigo-400';
                        bgClass = 'bg-indigo-900/30 border-indigo-500/30';
                    }
                }

                return (
                    <div key={param} className={`p-3 rounded-xl border ${bgClass} ${hasFactor ? '' : 'border-slate-700'} flex items-center justify-between`}>
                        <span className="text-sm font-medium text-slate-300 uppercase">{param}</span>
                        <div className={`p-1.5 rounded-md ${hasFactor ? 'bg-black/20' : ''} ${colorClass}`}>
                            <Icon size={16} />
                        </div>
                    </div>
                );
            })}
        </div>

        <div className="mt-auto space-y-2 z-10 text-sm">
            <div className="flex justify-between items-center text-slate-300 border-b border-slate-700 pb-2 mb-2">
                <span className="text-slate-400">Persistence:</span>
                <span className="font-semibold">{factors.length > 0 ? (latestPrediction.risk_score > 50 ? '12 readings' : '5 readings') : '0 readings'}</span>
            </div>
            
            <div className="flex justify-between items-center text-slate-300 border-b border-slate-700 pb-2 mb-2">
                <span className="text-slate-400">Baseline deviation:</span>
                <span className="font-semibold text-amber-400">{factors.length > 0 ? 'Increasing' : 'Stable'}</span>
            </div>

            <div className="flex justify-between items-center text-slate-300 border-b border-slate-700 pb-2 mb-2">
                <span className="text-slate-400">Cross-parameter relation:</span>
                <span className={`font-semibold ${factors.length >= 3 ? 'text-rose-400' : 'text-slate-500'}`}>
                    {factors.length >= 3 ? 'Detected' : 'None'}
                </span>
            </div>

            <div className="flex justify-between items-center text-slate-300 border-b border-slate-700 pb-2 mb-2">
                <span className="text-slate-400">Anomaly:</span>
                <span className={`font-semibold ${latestPrediction.risk_score >= 50 ? 'text-rose-400' : 'text-slate-500'}`}>
                    {latestPrediction.risk_score >= 50 ? 'Detected' : 'None'}
                </span>
            </div>
            
            <div className="flex justify-between items-center text-slate-300 pt-1">
                <span className="text-slate-400">Risk:</span>
                <span className={`font-bold text-lg ${latestPrediction.risk_score > 50 ? 'text-rose-400' : 'text-teal-400'}`}>
                    {activeSource.trend === 'RISING' ? 'Rising' : activeSource.trend === 'FALLING' ? 'Falling' : 'Stable'}
                </span>
            </div>
        </div>
    </div>
  );
};

export default WhatAISees;
