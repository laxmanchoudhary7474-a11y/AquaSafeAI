import { useData } from '../contexts/DataContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const RiskTrajectoryChart = () => {
  const { readingsHistory } = useData();

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex justify-between">
        <span>Risk Trajectory & Early Warning</span>
        <span className="text-xs font-normal px-2 py-1 bg-amber-100 text-amber-800 rounded-md">Prototype operational risk estimate</span>
      </h3>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={readingsHistory}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="time" tick={{fontSize: 12, fill: '#64748b'}} tickMargin={10} />
            <YAxis tick={{fontSize: 12, fill: '#64748b'}} domain={[0, 100]} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            
            <ReferenceLine y={50} label={{ position: 'top', value: 'Early Warning Threshold', fill: '#f59e0b', fontSize: 11 }} stroke="#f59e0b" strokeDasharray="3 3" />
            <ReferenceLine y={75} label={{ position: 'top', value: 'Alert Triggered', fill: '#e11d48', fontSize: 11 }} stroke="#e11d48" strokeDasharray="3 3" />
            
            <Line 
              type="monotone" 
              dataKey="risk" 
              stroke="#4f46e5" 
              strokeWidth={3} 
              dot={false} 
              name="AI Risk Score" 
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-around text-xs text-slate-500">
        <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-teal-400 mr-2"></div> Low Risk (0-49)</div>
        <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-amber-400 mr-2"></div> Early Warning (50-74)</div>
        <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-rose-500 mr-2"></div> Alert (75-100)</div>
      </div>
    </div>
  );
};

export default RiskTrajectoryChart;
