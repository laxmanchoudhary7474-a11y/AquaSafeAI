import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { DataProvider } from './contexts/DataContext';

// Pages
import Overview from './pages/Overview';
import Sources from './pages/Sources';
import LiveMonitor from './pages/LiveMonitor';
import AIInsights from './pages/AIInsights';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import Devices from './pages/Devices';
import MapView from './pages/MapView';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/sources" element={<Sources />} />
            <Route path="/monitor" element={<LiveMonitor />} />
            <Route path="/insights" element={<AIInsights />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </DataProvider>
    </BrowserRouter>
  );
}

export default App;
