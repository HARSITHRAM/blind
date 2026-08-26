import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Overview } from './pages/Overview';
import { Devices } from './pages/Devices';
import { StickDetail } from './pages/StickDetail';
import { SmartSticks } from './pages/SmartSticks';
import { ShopDetail } from './pages/ShopDetail';
import { LiveTelemetry } from './pages/LiveTelemetry';
import { Logs } from './pages/Logs';
import { LogDetail } from './pages/LogDetail';
import { Inventory } from './pages/Inventory';
import { Transactions } from './pages/Transactions';
import { Alerts } from './pages/Alerts';
import { Analytics } from './pages/Analytics';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { useAuthStore } from './store/useAuthStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Overview />} />
          <Route path="devices" element={<Devices />} />
          <Route path="sticks/:id" element={<StickDetail />} />
          <Route path="sticks/:id/telemetry" element={<LiveTelemetry />} />
          <Route path="sticks" element={<SmartSticks />} />
          <Route path="shops/:id" element={<ShopDetail />} />
          <Route path="shops" element={<div className="text-white p-4">Shop Units Page</div>} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="logs" element={<Logs />} />
          <Route path="logs/:id" element={<LogDetail />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
