import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  MapPin,
  Smartphone,
  Store,
  Terminal,
  Wifi,
  CreditCard,
  IndianRupee,
} from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { cn } from '../lib/utils';
import { useAuthStore } from '../store/useAuthStore';
import { DeviceMap } from '../components/DeviceMap';

const chartData = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 5000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

export function Overview() {
  const { user } = useAuthStore();
  
  const [analytics, setAnalytics] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8000/api/analytics').then(r => r.json()),
      fetch('http://localhost:8000/api/logs').then(r => r.json()),
      fetch('http://localhost:8000/api/transactions').then(r => r.json()),
      fetch('http://localhost:8000/api/devices').then(r => r.json())
    ]).then(([analyticsData, logsData, txData, devicesData]) => {
      setAnalytics(analyticsData);
      setLogs(logsData);
      setTransactions(txData);
      
      const mappedDevices = devicesData.map((d: any) => {
        let lat = 13.0067;
        let lng = 80.2206;
        if (d.location) {
          const parts = d.location.split(',');
          if (parts.length === 2) {
            lat = parseFloat(parts[0]);
            lng = parseFloat(parts[1]);
          }
        }
        return {
          id: d.id,
          type: d.type,
          name: d.owner || d.type,
          lat,
          lng,
          status: d.status
        };
      });
      setDevices(mappedDevices);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to fetch dashboard data:", err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Good morning, {user?.name || 'User'}</h1>
          <p className="text-textMuted mt-1">Here is the latest from your Smart Stick network</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="ACTIVE DEVICES"
          value={analytics?.activeDevices || 0}
          subtitle="+0% from last week"
          icon={Smartphone}
        />
        <KpiCard
          title="ONLINE"
          value={`${analytics?.activeDevices || 0} / ${analytics?.activeDevices || 0}`}
          subtitle="100%"
          icon={Wifi}
          status="success"
        />
        <KpiCard
          title="ACTIVE SHOPS"
          value={1}
          icon={Store}
        />
        <KpiCard
          title="TODAY'S SALES"
          value={`₹${analytics?.dailyRevenue || 0}`}
          icon={IndianRupee}
          status="success"
        />
        <KpiCard
          title="TRANSACTIONS"
          value={transactions.length}
          icon={CreditCard}
        />
        <KpiCard
          title="CRITICAL ALERTS"
          value={analytics?.sosAlerts || 0}
          icon={AlertTriangle}
          status="error"
        />
      </div>

      {/* Health & Live Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Health Overview (Left) */}
        <div className="lg:col-span-2 glass-panel p-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">System Activity</h2>
            <button className="text-primary hover:text-primaryHover text-sm font-medium flex items-center gap-1">
              View Analytics <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', borderRadius: '8px' }}
                  itemStyle={{ color: '#f9fafb' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live System Events (Right) */}
        <div className="glass-panel p-5 flex flex-col h-[340px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Terminal size={18} className="text-textMuted" /> Live Events
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {logs.slice(0, 8).map((log) => (
              <div key={log.id} className="flex gap-3 text-sm">
                <span className="text-textMuted shrink-0">{log.timestamp}</span>
                <span className={cn(
                  "shrink-0 font-medium w-16",
                  log.severity === 'INFO' ? 'text-blue-400' :
                  log.severity === 'WARNING' ? 'text-warning' :
                  log.severity === 'ERROR' ? 'text-error' : 'text-red-500'
                )}>{log.severity}</span>
                <div className="flex-1 truncate text-white">
                  <span className="text-textMuted mr-2">[{log.device}]</span>
                  {log.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map Placeholder -> Real Map */}
      <div className="glass-panel p-5">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <MapPin size={18} className="text-primary" /> Active Locations
        </h2>
        <DeviceMap devices={devices} height="300px" />
      </div>

      {/* Transactions and Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Transactions */}
        <div className="glass-panel p-5 overflow-hidden flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 text-textMuted">
                  <th className="pb-3 pr-4 font-medium">ID</th>
                  <th className="pb-3 pr-4 font-medium">Shop</th>
                  <th className="pb-3 pr-4 font-medium">Product</th>
                  <th className="pb-3 pr-4 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 5).map((tx) => (
                  <tr key={tx.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pr-4 font-medium text-white">{tx.id}</td>
                    <td className="py-3 pr-4 text-textMuted">{tx.device}</td>
                    <td className="py-3 pr-4 text-white">{tx.items[0]}</td>
                    <td className="py-3 pr-4 text-white">{tx.amount}</td>
                    <td className="py-3">
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-medium bg-opacity-20",
                        tx.status === 'Completed' ? "bg-success text-success" :
                        tx.status === 'Pending' ? "bg-warning text-warning" : "bg-error text-error"
                      )}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="glass-panel p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-error" /> Recent Critical Alerts
          </h2>
          <div className="space-y-3">
            {logs.filter(l => l.severity === 'CRITICAL' || l.severity === 'ERROR').slice(0, 4).map(alert => (
              <div key={alert.id} className="p-3 rounded-xl border border-error/20 bg-error/5 flex items-start gap-3">
                <div className="mt-0.5">
                  <AlertTriangle size={16} className="text-error" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{alert.device}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-error/20 text-error font-medium">{alert.type}</span>
                  </div>
                  <p className="text-sm text-textMuted mt-1">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{alert.timestamp} • {alert.id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// Subcomponent for KPI Card
function KpiCard({ title, value, subtitle, icon: Icon, status }: { title: string, value: string | number, subtitle?: string, icon: any, status?: 'success' | 'error' | 'warning' }) {
  return (
    <div className="glass-card p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold tracking-wider text-textMuted uppercase">{title}</span>
        <Icon size={16} className={cn(
          "text-textMuted",
          status === 'success' && "text-success",
          status === 'error' && "text-error",
          status === 'warning' && "text-warning"
        )} />
      </div>
      <div className="mt-auto">
        <div className="text-2xl font-bold text-white">{value}</div>
        {subtitle && <div className="text-xs text-textMuted mt-1">{subtitle}</div>}
      </div>
    </div>
  );
}
