import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Activity, 
  Cpu, 
  Navigation2, 
  Eye, 
  Wifi, 
  AlertTriangle,
  Terminal,
  RotateCcw,
  Stethoscope,
  Ban,
  DownloadCloud
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { cn } from '../lib/utils';
import { DeviceMap } from '../components/DeviceMap';

export function StickDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [device, setDevice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/devices')
      .then(res => res.json())
      .then(data => {
        const found = data.find((d: any) => d.id === id) || data.find((d: any) => d.type === 'Smart Stick') || data[0];
        setDevice(found);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch device:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading || !device) {
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
            onClick={() => navigate('/devices')}
            className="p-2 bg-surfaceHighlight border border-white/10 rounded-lg text-textMuted hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{device.id}</h1>
              <span className={cn(
                "px-2.5 py-1 rounded-full text-xs font-bold tracking-wider",
                device.status === 'ONLINE' ? 'bg-success/20 text-success border border-success/30' :
                device.status === 'WARNING' ? 'bg-warning/20 text-warning border border-warning/30' :
                device.status === 'CRITICAL' ? 'bg-error/20 text-error border border-error/30' : 
                'bg-gray-500/20 text-gray-400 border border-gray-500/30'
              )}>
                {device.status}
              </span>
            </div>
            <p className="text-textMuted mt-1">Smart Blind Stick • Owned by {device.owner}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <ActionButton icon={Activity} label="Live Status" primary onClick={() => navigate(`/sticks/${id}/telemetry`)} />
          <ActionButton icon={Terminal} label="Command" />
          <ActionButton icon={RotateCcw} label="Restart" />
          <ActionButton icon={Stethoscope} label="Diagnostics" />
          
          {user?.role === 'ADMIN' && (
            <>
              <ActionButton 
                icon={Ban} 
                label="Block Device" 
                onClick={() => alert(`Blocking device ${id}...`)} 
              />
              <ActionButton 
                icon={DownloadCloud} 
                label="Update Firmware" 
                onClick={() => alert(`Triggering OTA update for ${id}...`)} 
              />
            </>
          )}
        </div>
      </div>

      {/* Main Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Device Health */}
        <div className="glass-panel p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
            <Cpu size={18} className="text-primary" /> Device Health
          </h2>
          <div className="space-y-3">
            <DetailRow label="Battery" value={`${device.battery}%`} />
            <DetailRow label="Temperature" value={`${device.temperature}°C`} />
            <DetailRow label="CPU Usage" value="45%" />
            <DetailRow label="Memory" value="1.2GB / 4GB" />
            <DetailRow label="Disk" value="15GB / 32GB" />
            <DetailRow label="Uptime" value="14d 5h 22m" />
          </div>
        </div>

        {/* Navigation / Map */}
        <div className="glass-panel p-5 flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
            <Navigation2 size={18} className="text-success" /> Live Location
          </h2>
          <div className="flex-1 flex flex-col justify-between h-[250px] mb-4">
            <DeviceMap 
              devices={[{
                id: device.id, 
                type: device.type, 
                name: device.owner, 
                lat: device.location ? parseFloat(device.location.split(',')[0]) : 13.0, 
                lng: device.location ? parseFloat(device.location.split(',')[1]) : 80.2, 
                status: device.status 
              }]} 
              height="100%" 
            />
          </div>
          <div className="space-y-3 mt-4">
            <DetailRow label="Coordinates" value={device.location} />
            <DetailRow label="Status" value="Navigating" valueClass="text-success" />
          </div>
        </div>

        {/* Vision (YOLO) */}
        <div className="glass-panel p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
            <Eye size={18} className="text-cyan-400" /> Vision
          </h2>
          <div className="space-y-3">
            <DetailRow label="Camera" value="Active (1080p)" />
            <DetailRow label="Model" value="YOLOv8 Nano" />
            <DetailRow label="Inference" value="24 FPS" />
            <DetailRow label="Latency" value="42ms" />
            <DetailRow label="Last Detected" value="Person, Car, Traffic Light" />
            <DetailRow label="Confidence" value="92% avg" />
          </div>
        </div>

        {/* Communication */}
        <div className="glass-panel p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
            <Wifi size={18} className="text-blue-400" /> Communication
          </h2>
          <div className="space-y-3">
            <DetailRow label="MQTT State" value="Connected" valueClass="text-success" />
            <DetailRow label="Network" value={device.network} />
            <DetailRow label="Signal" value="-58 dBm (Excellent)" />
            <DetailRow label="Heartbeat" value="2 seconds ago" />
            <DetailRow label="Packets" value="12,450 TX / 420 RX" />
            <DetailRow label="Firmware" value={device.firmware} />
          </div>
        </div>

        {/* Safety */}
        <div className="glass-panel p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
            <AlertTriangle size={18} className="text-error" /> Safety
          </h2>
          <div className="space-y-3">
            <DetailRow label="SOS Status" value="READY" valueClass="text-success" />
            <DetailRow label="Last Emergency" value="Oct 12, 2025" />
            <DetailRow label="Emergency Contacts" value="3 Configured" />
            <DetailRow label="SOS Count" value="2" />
            <DetailRow label="Fall Detection" value="Enabled" />
            <div className="pt-2">
              <button className="w-full py-2 bg-error/10 text-error border border-error/20 rounded-lg text-sm font-medium hover:bg-error hover:text-white transition-colors">
                Trigger Test SOS
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function DetailRow({ label, value, valueClass = "text-white" }: { label: string, value: string, valueClass?: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-textMuted">{label}</span>
      <span className={cn("font-medium text-right", valueClass)}>{value}</span>
    </div>
  );
}

function ActionButton({ icon: Icon, label, primary, onClick }: { icon: any, label: string, primary?: boolean, onClick?: () => void }) {
  return (
    <button onClick={onClick} className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border",
      primary 
        ? "bg-primary text-white border-primary hover:bg-primaryHover hover:border-primaryHover shadow-[0_0_15px_rgba(14,165,233,0.3)]" 
        : "bg-surfaceHighlight text-textMuted border-white/10 hover:text-white hover:border-white/20 hover:bg-white/5"
    )}>
      <Icon size={16} />
      {label}
    </button>
  );
}
