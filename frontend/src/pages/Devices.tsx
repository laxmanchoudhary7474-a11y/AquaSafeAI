import { useData } from '../contexts/DataContext';

const Devices = () => {
  const { sources } = useData();

  const getDeviceStatus = (index: number) => {
      if (index === 0) return { status: 'ONLINE', seen: 'Just now', fw: 'v2.1.0' };
      if (index === 1) return { status: 'STALE', seen: '18 min', fw: 'v2.1.0' };
      if (index === 2) return { status: 'ONLINE', seen: '4 sec', fw: 'v2.0.1' };
      return { status: 'OFFLINE', seen: '2 days', fw: 'v1.8.0' };
  };

  return (
    <div className="space-y-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">IoT Fleet Management</h1>
            <p className="text-sm text-slate-500 mt-1">SIMULATION / DEMO DATA</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Device ID</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Source</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Seen</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Firmware</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {sources.map((s, idx) => {
                    const meta = getDeviceStatus(idx);
                    return (
                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-mono text-sm text-slate-800">ESP32-WATER-0{idx+1}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${meta.status === 'ONLINE' ? 'bg-teal-100 text-teal-700' : meta.status === 'STALE' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {meta.status}
                                </span>
                            </td>
                            <td className="p-4 text-sm text-slate-600">{s.name}</td>
                            <td className="p-4 text-sm text-slate-500">{meta.seen}</td>
                            <td className="p-4 text-sm text-slate-500">{meta.fw}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default Devices;
