import { Link, useLocation } from 'react-router-dom';
import { Activity, Droplet, Server, AlertTriangle, BarChart3, Settings } from 'lucide-react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navItems = [
    { name: 'Overview', path: '/', icon: Activity },
    { name: 'Water Sources', path: '/sources', icon: Droplet },
    { name: 'Live Monitor', path: '/monitor', icon: Activity },
    { name: 'AI Insights', path: '/insights', icon: BarChart3 },
    { name: 'Alerts', path: '/alerts', icon: AlertTriangle },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Devices', path: '/devices', icon: Server },
    { name: 'Source Map', path: '/map', icon: Droplet },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="h-16 flex items-center px-6 bg-slate-950 font-bold text-white tracking-wide">
          <Droplet className="w-6 h-6 mr-2 text-teal-400" />
          AquaSafeAI
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                    location.pathname === item.path
                      ? 'bg-slate-800 text-teal-400 font-medium'
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center px-8 justify-between shadow-sm z-10">
          <h1 className="text-xl font-semibold text-slate-800">
            {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm font-medium text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
              SYSTEM LIVE
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300"></div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
