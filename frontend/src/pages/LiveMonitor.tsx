import { useData } from '../contexts/DataContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LiveMonitor = () => {
  const { readingsHistory, activeSource } = useData();

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Live Telemetry Monitor</h1>
        <p className="text-sm text-slate-500 mt-1">Source: {activeSource?.name || 'Loading...'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Turbidity (NTU)" data={readingsHistory} dataKey="turbidity" color="#0ea5e9" />
        <ChartCard title="TDS (ppm)" data={readingsHistory} dataKey="tds" color="#f59e0b" />
        <ChartCard title="Conductivity (µS/cm)" data={readingsHistory} dataKey="conductivity" color="#8b5cf6" />
        <ChartCard title="pH Level" data={readingsHistory} dataKey="ph" color="#10b981" />
      </div>
    </div>
  );
};

const ChartCard = ({ title, data, dataKey, color }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-72">
        <h3 className="text-sm font-semibold text-slate-600 mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" tick={{fontSize: 10, fill: '#94a3b8'}} tickMargin={10} />
                <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
        </ResponsiveContainer>
    </div>
);

export default LiveMonitor;
