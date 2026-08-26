import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Terminal, 
  AlertTriangle, 
  CheckCircle, 
  Stethoscope, 
  Ticket 
} from 'lucide-react';
import { cn } from '../lib/utils';

export function LogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [log, setLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/logs')
      .then(res => res.json())
      .then(data => {
        const found = data.find((l: any) => l.id === id) || data[0];
        setLog(found);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch log:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading || !log) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/logs')}
            className="p-2 bg-surfaceHighlight border border-white/10 rounded-lg text-textMuted hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white font-mono">{log.id}</h1>
              <span className={cn(
                "px-2.5 py-1 rounded-full text-xs font-bold tracking-wider",
                log.severity === 'INFO' ? 'bg-blue-400/20 text-blue-400' :
                log.severity === 'WARNING' ? 'bg-warning/20 text-warning' :
                log.severity === 'ERROR' ? 'bg-error/20 text-error' : 
                'bg-red-500/20 text-red-500 border border-red-500/50'
              )}>
                {log.severity}
              </span>
            </div>
            <p className="text-textMuted mt-1">Logged at {log.timestamp} from {log.device}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-surfaceHighlight text-textMuted hover:text-white border border-white/10 rounded-lg text-sm font-medium transition-colors">
            <CheckCircle size={16} /> Acknowledge
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-surfaceHighlight text-textMuted hover:text-white border border-white/10 rounded-lg text-sm font-medium transition-colors">
            <Ticket size={16} /> Create Incident
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white border border-primary hover:bg-primaryHover rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(14,165,233,0.3)]">
            <Stethoscope size={16} /> Send Diagnostic
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exception Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-5">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
              <Terminal size={18} className="text-primary" /> Exception Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 text-sm text-textMuted">Component</div>
                <div className="col-span-2 text-sm text-white font-medium">{log.type} Service</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 text-sm text-textMuted">Exception Type</div>
                <div className="col-span-2 text-sm text-white font-mono bg-surfaceHighlight/50 p-1.5 rounded w-max">
                  {log.severity === 'CRITICAL' ? 'HARDWARE_FAILURE' : 'TIMEOUT_EXCEPTION'}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 text-sm text-textMuted">Message</div>
                <div className="col-span-2 text-sm text-white">{log.message}</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#0a0a0a] border border-white/10 rounded-lg font-mono text-sm overflow-x-auto text-gray-300">
              <div className="text-red-400 mb-2">Traceback (most recent call last):</div>
              <div className="pl-4 border-l-2 border-white/10 space-y-1">
                <div className="text-gray-400">File "/app/services/{log.type.toLowerCase()}_service.py", line 42, in process</div>
                <div>{'    '}await self.read_sensor_data()</div>
                <div className="text-gray-400">File "/app/drivers/sensor_interface.py", line 128, in read_sensor_data</div>
                <div>{'    '}raise TimeoutError("No response from sensor within 5000ms")</div>
                <div className="text-red-400 mt-2">TimeoutError: {log.message}</div>
              </div>
            </div>
          </div>
          
          {/* Telemetry Snapshot */}
          <div className="glass-panel p-5">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
              <AlertTriangle size={18} className="text-warning" /> Telemetry Snapshot
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-surfaceHighlight/30 rounded-lg border border-white/5">
                <div className="text-xs text-textMuted mb-1">Temperature</div>
                <div className="text-lg font-bold text-white">43°C</div>
              </div>
              <div className="p-3 bg-surfaceHighlight/30 rounded-lg border border-white/5">
                <div className="text-xs text-textMuted mb-1">Battery</div>
                <div className="text-lg font-bold text-white">71%</div>
              </div>
              <div className="p-3 bg-surfaceHighlight/30 rounded-lg border border-white/5">
                <div className="text-xs text-textMuted mb-1">Network</div>
                <div className="text-lg font-bold text-white">-58 dBm</div>
              </div>
              <div className="p-3 bg-error/10 rounded-lg border border-error/20">
                <div className="text-xs text-error mb-1">Module State</div>
                <div className="text-lg font-bold text-error">Unresponsive</div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline / Context */}
        <div className="glass-panel p-5">
          <h2 className="text-lg font-semibold text-white mb-4 border-b border-white/5 pb-3">Context Timeline</h2>
          <div className="relative border-l border-white/10 ml-3 space-y-6">
            
            <div className="relative pl-6">
              <div className="absolute w-3 h-3 bg-surfaceHighlight border-2 border-textMuted rounded-full -left-1.5 top-1"></div>
              <p className="text-xs text-textMuted mb-1">-2 mins</p>
              <p className="text-sm text-white">System initialization OK</p>
            </div>
            
            <div className="relative pl-6">
              <div className="absolute w-3 h-3 bg-surfaceHighlight border-2 border-textMuted rounded-full -left-1.5 top-1"></div>
              <p className="text-xs text-textMuted mb-1">-45 secs</p>
              <p className="text-sm text-white">Warning: High latency detected in {log.type} service</p>
            </div>

            <div className="relative pl-6">
              <div className="absolute w-4 h-4 bg-error/20 border-2 border-error rounded-full -left-2 top-0.5 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
              <p className="text-xs text-error mb-1">T-0 (This Event)</p>
              <p className="text-sm font-bold text-error">{log.message}</p>
            </div>

            <div className="relative pl-6">
              <div className="absolute w-3 h-3 bg-surfaceHighlight border-2 border-textMuted rounded-full -left-1.5 top-1"></div>
              <p className="text-xs text-textMuted mb-1">+10 secs</p>
              <p className="text-sm text-white">Automated recovery attempted</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
