import OperationalWorkflow from '../components/OperationalWorkflow';
import { useData } from '../contexts/DataContext';

const Analytics = () => {
  const { latestPrediction, alerts, simState } = useData();
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Business Intelligence & Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Operational Value and Predictive Performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 text-indigo-600">The Early-Warning Advantage</h3>
            <p className="text-slate-600 leading-relaxed text-sm mb-6">
                Instead of reviewing raw sensor values across multiple sources, operators can focus attention on the sources where the AI system identifies sustained deterioration.
            </p>
            <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-600">Earlier awareness</span>
                    <span className="text-sm font-bold text-teal-600">+45 mins</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-600">Reduced manual monitoring</span>
                    <span className="text-sm font-bold text-teal-600">70% reduction</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-600">Faster investigation</span>
                    <span className="text-sm font-bold text-teal-600">Directed responses</span>
                </div>
            </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Current Operational Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Current Risk</div>
                    <div className="text-2xl font-bold text-slate-800">{latestPrediction?.risk_score?.toFixed(1) || '--'}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Alert Count</div>
                    <div className="text-2xl font-bold text-slate-800">{alerts.length}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Anomaly Events</div>
                    <div className="text-2xl font-bold text-slate-800">{latestPrediction?.factors?.length || 0}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Active Scenario</div>
                    <div className="text-lg font-bold text-indigo-600 uppercase">{simState}</div>
                </div>
            </div>
        </div>
      </div>

      <OperationalWorkflow />
    </div>
  );
};

export default Analytics;
