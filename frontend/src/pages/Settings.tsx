const Settings = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">System Configuration</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 space-y-1">
            <div className="px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg text-sm cursor-pointer">Profile</div>
            <div className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-medium rounded-lg text-sm cursor-pointer">Users & Roles</div>
            <div className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-medium rounded-lg text-sm cursor-pointer">Risk Configuration</div>
            <div className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-medium rounded-lg text-sm cursor-pointer">Alert Configuration</div>
        </div>
        <div className="flex-1 p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Profile Settings</h3>
            <div className="space-y-4 max-w-md">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Organization Name</label>
                    <input type="text" className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 text-slate-800 focus:outline-none" value="Municipal Water Authority" readOnly />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Operator Role</label>
                    <input type="text" className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 text-slate-800 focus:outline-none" value="Admin" readOnly />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
