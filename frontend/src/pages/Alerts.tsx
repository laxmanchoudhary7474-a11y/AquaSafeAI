import { useData } from '../contexts/DataContext';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const Alerts = () => {
  const { alerts, acknowledgeAlert, resolveAlert } = useData();

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Incident Management</h1>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {alerts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
                <CheckCircle size={48} className="mx-auto text-teal-400 mb-4" />
                <h3 className="text-lg font-bold text-slate-700">No Active Incidents</h3>
                <p className="text-slate-500">All monitored water sources are operating safely.</p>
            </div>
        ) : (
            alerts.map((alert: any) => (
            <div key={alert.id} className="bg-white p-6 rounded-2xl border-l-4 border-rose-500 border-t border-r border-b border-slate-200 shadow-sm">
                <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-bold text-slate-800">{alert.title}</h3>
                                <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-md uppercase tracking-wide">
                                    {alert.severity} RISK
                                </span>
                            </div>
                            <div className="flex items-center text-xs text-slate-500 mb-4">
                                <Clock size={12} className="mr-1" /> Created: {new Date(alert.created_at).toLocaleString()}
                                <span className="mx-2">•</span>
                                Source: {alert.source_id}
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed mb-4">
                                {alert.message}
                            </p>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Recommended Action</h4>
                                <p className="text-sm text-slate-700 italic">"Investigate the source and verify readings using appropriate field/laboratory procedures."</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-2">
                    <button onClick={() => acknowledgeAlert(alert.id)} className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors">
                        Acknowledge
                    </button>
                    <button onClick={() => resolveAlert(alert.id)} className="px-4 py-2 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg text-sm font-medium transition-colors">
                        Resolve Incident
                    </button>
                </div>
            </div>
            ))
        )}
      </div>
    </div>
  );
};

export default Alerts;
