import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertTriangle, Search, Filter, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export function Alerts() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/api/logs')
      .then(res => res.json())
      .then(data => {
        // Map logs to alerts
        const mapped = data
          .filter((l: any) => l.severity === 'CRITICAL' || l.severity === 'ERROR' || l.severity === 'WARNING')
          .map((log: any) => ({
            id: log.id,
            device: log.device,
            type: log.severity === 'CRITICAL' ? 'Dispensing failure' : log.severity === 'ERROR' ? 'GPS Failure' : 'Camera Warning',
            severity: log.severity,
            message: log.message,
            order: log.severity === 'CRITICAL' ? 'ORDER-1842' : undefined,
            timestamp: log.timestamp,
          }));
        setAlerts(mapped);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch alerts:", err);
        setLoading(false);
      });
  }, []);

  const filtered = alerts.filter(a => {
    if (filter !== 'ALL' && a.severity !== filter) return false;
    if (search && !a.message.toLowerCase().includes(search.toLowerCase()) && !a.device.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell size={24} className="text-error" /> Alert Center
          </h1>
          <p className="text-textMuted mt-1">Centralized critical system alerts and notifications</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
            <input 
              type="text" 
              placeholder="Search alerts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surfaceHighlight border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-surfaceHighlight border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary/50"
          >
            <option value="ALL">All Alerts</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="ERROR">Errors</option>
            <option value="WARNING">Warnings</option>
          </select>
          <button className="p-2 bg-surfaceHighlight border border-white/10 rounded-lg text-textMuted hover:text-white transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-error border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.map(alert => (
          <div key={alert.id} className={cn(
            "p-5 rounded-xl border flex flex-col md:flex-row gap-4 justify-between items-start md:items-center transition-all",
            alert.severity === 'CRITICAL' ? 'bg-error/10 border-error/50 shadow-[0_0_20px_rgba(239,68,68,0.15)]' :
            alert.severity === 'ERROR' ? 'bg-error/5 border-error/20' : 'bg-warning/5 border-warning/20'
          )}>
            <div className="flex gap-4">
              <div className="mt-1">
                {alert.severity === 'CRITICAL' ? (
                  <AlertTriangle size={24} className="text-error animate-pulse" />
                ) : (
                  <AlertTriangle size={24} className={alert.severity === 'ERROR' ? "text-error" : "text-warning"} />
                )}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold tracking-wider",
                    alert.severity === 'CRITICAL' ? "bg-error text-white" : 
                    alert.severity === 'ERROR' ? "bg-error/20 text-error" : "bg-warning/20 text-warning"
                  )}>
                    {alert.severity}
                  </span>
                  <span className="font-semibold text-white">{alert.device}</span>
                  <span className="text-textMuted text-sm text-mono">{alert.timestamp}</span>
                </div>
                
                <h3 className="text-white text-lg font-medium mt-2">{alert.type}</h3>
                
                {alert.order && (
                  <p className="text-sm font-medium text-textMuted mt-1">
                    Order: <span className="text-white">{alert.order}</span>
                  </p>
                )}
                
                <p className="text-textMuted text-sm mt-1 max-w-2xl">
                  {alert.message}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
              <button 
                onClick={() => navigate(alert.device.startsWith('SHOP') ? `/shops/${alert.device}` : `/sticks/${alert.device}`)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-surfaceHighlight text-white hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors"
              >
                View Device
              </button>
              {alert.order && (
                <button 
                  onClick={() => navigate('/transactions')}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-surfaceHighlight text-white hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors"
                >
                  View Transaction
                </button>
              )}
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-success/20 text-success hover:bg-success hover:text-white border border-success/30 rounded-lg text-sm font-medium transition-all">
                <CheckCircle size={16} /> Acknowledge
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="glass-panel p-12 text-center text-textMuted">
            <CheckCircle size={48} className="mx-auto mb-4 text-success/50" />
            <h3 className="text-xl font-medium text-white mb-2">All clear</h3>
            <p>No active alerts matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
