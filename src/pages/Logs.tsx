import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Terminal, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppStore } from '../store/useAppStore';

export function Logs() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (useAppStore.getState().isDemoMode) {
          const { mockLogs } = await import('../lib/mockData');
          setLogs(mockLogs);
        } else {
          const res = await fetch('http://localhost:8000/api/logs');
          const data = await res.json();
          setLogs(data);
        }
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    const unsub = useAppStore.subscribe((state: any, prevState: any) => {
      if (state.isDemoMode !== prevState.isDemoMode) {
        loadData();
      }
    });
    return unsub;
  }, []);

  const filteredLogs = logs.filter(log => {
    if (severityFilter !== 'ALL' && log.severity !== severityFilter) return false;
    if (search && !log.message.toLowerCase().includes(search.toLowerCase()) && !(log.id && log.id.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Terminal size={24} className="text-primary" /> System Logs
          </h1>
          <p className="text-textMuted mt-1">Centralized error and event tracking</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
            <input 
              type="text" 
              placeholder="Search logs or Event ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surfaceHighlight border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <select 
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2 bg-surfaceHighlight border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary/50"
          >
            <option value="ALL">All Severities</option>
            <option value="INFO">Info</option>
            <option value="WARNING">Warning</option>
            <option value="ERROR">Error</option>
            <option value="CRITICAL">Critical</option>
          </select>
          <button className="p-2 bg-surfaceHighlight border border-white/10 rounded-lg text-textMuted hover:text-white transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-surfaceHighlight/30 text-textMuted">
                <th className="py-3 px-4 font-medium w-24">Time</th>
                <th className="py-3 px-4 font-medium w-32">Device</th>
                <th className="py-3 px-4 font-medium w-32">Type</th>
                <th className="py-3 px-4 font-medium w-28">Severity</th>
                <th className="py-3 px-4 font-medium">Message</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-textMuted">Loading logs...</td>
                </tr>
              ) : filteredLogs.map((log) => (
                <tr 
                  key={log.id} 
                  onClick={() => navigate(`/logs/${log.id}`)}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 text-textMuted">{log.timestamp}</td>
                  <td className="py-3 px-4 font-medium text-white">{log.device}</td>
                  <td className="py-3 px-4 text-textMuted">{log.type}</td>
                  <td className="py-3 px-4">
                    <span className={cn(
                      "px-2 py-1 rounded text-[10px] font-bold tracking-wider",
                      log.severity === 'INFO' ? 'bg-blue-400/10 text-blue-400' :
                      log.severity === 'WARNING' ? 'bg-warning/10 text-warning' :
                      log.severity === 'ERROR' ? 'bg-error/10 text-error' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    )}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white truncate max-w-md">
                    {log.message}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-primary hover:text-primaryHover opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-textMuted">
                    No logs found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
