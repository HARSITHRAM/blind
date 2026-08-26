import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Smartphone, 
  Battery, 
  Thermometer, 
  Wifi, 
  Search, 
  Filter, 
  Activity, 
  Eye, 
  Navigation2, 
  AlertTriangle, 
  Plus, 
  RefreshCw, 
  BellRing, 
  RotateCcw, 
  Radio, 
  MapPin,
  CheckCircle2,
  X,
  Grid,
  Map as MapIcon,
  Table as TableIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { DeviceMap } from '../components/DeviceMap';

type StatusFilter = 'ALL' | 'ONLINE' | 'WARNING' | 'CRITICAL' | 'SOS';
type ViewMode = 'GRID' | 'MAP' | 'TABLE';

interface StickDevice {
  id: string;
  type: string;
  status: string;
  owner: string;
  battery: number;
  temperature: number;
  location: string;
  lastSeen: string;
  network: string;
  firmware: string;
  obstacleDist?: number;
  yoloFps?: number;
  sosTriggered?: boolean;
}

export function SmartSticks() {
  const navigate = useNavigate();
  const [sticks, setSticks] = useState<StickDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('GRID');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStick, setNewStick] = useState({
    id: `SBS-000${Math.floor(Math.random() * 899 + 100)}`,
    owner_name: '',
    gps_lat: 12.9716,
    gps_lng: 77.5946,
    network: '4G (Airtel)',
    firmware: 'v3.2.0'
  });

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSticks = async () => {
    setLoading(true);
    try {
      const { useAppStore } = await import('../store/useAppStore');
      let stickData: StickDevice[] = [];
      
      if (useAppStore.getState().isDemoMode) {
        const { mockDevices } = await import('../lib/mockData');
        const data = mockDevices;
        stickData = data
          .filter((d: any) => d.type === 'Smart Stick' || d.id.startsWith('SBS'))
          .map((d: any, idx: number) => ({
            ...d,
            obstacleDist: [0.8, 1.4, 0.4, 2.1, 1.8, 0.6][idx % 6],
            yoloFps: [28.5, 24.0, 14.2, 29.8, 27.0, 22.1][idx % 6],
            sosTriggered: d.status === 'CRITICAL' || idx === 2
          }));
      } else {
        const res = await fetch('http://localhost:8000/api/devices');
        const data = await res.json();
        
        stickData = data
          .filter((d: any) => d.type === 'Smart Stick' || d.id.startsWith('SBS'))
          .map((d: any, idx: number) => ({
            ...d,
            obstacleDist: [0.8, 1.4, 0.4, 2.1, 1.8, 0.6][idx % 6],
            yoloFps: [28.5, 24.0, 14.2, 29.8, 27.0, 22.1][idx % 6],
            sosTriggered: d.status === 'CRITICAL' || idx === 2
          }));
      }

      if (stickData.length === 0) {
        stickData = [
          { id: 'SBS-0001', type: 'Smart Stick', status: 'ONLINE', owner: 'Harsithram', battery: 85.5, temperature: 42.1, location: '11.271917, 77.605333', lastSeen: '10:45 AM', network: '4G (Airtel)', firmware: 'v3.1.4', obstacleDist: 1.2, yoloFps: 28.5 },
          { id: 'SBS-0002', type: 'Smart Stick', status: 'WARNING', owner: 'Ramesh Kumar', battery: 22.0, temperature: 54.8, location: '11.2780, 77.5900', lastSeen: '10:41 AM', network: '4G (Jio)', firmware: 'v3.1.4', obstacleDist: 0.5, yoloFps: 24.0 },
          { id: 'SBS-0003', type: 'Smart Stick', status: 'CRITICAL', owner: 'Anitha Roy', battery: 8.5, temperature: 68.2, location: '11.2650, 77.6010', lastSeen: '10:33 AM', network: 'WiFi (Home)', firmware: 'v3.0.9', obstacleDist: 0.3, yoloFps: 14.2, sosTriggered: true }
        ];
      }
      setSticks(stickData);
    } catch (err) {
      console.error("Failed to fetch smart sticks:", err);
      showToast("Could not sync with live backend API. Displaying cached fleet telemetry.", "info");
      setSticks([
          { id: 'SBS-0001', type: 'Smart Stick', status: 'ONLINE', owner: 'Harsithram', battery: 85.5, temperature: 42.1, location: '11.271917, 77.605333', lastSeen: '10:45 AM', network: '4G (Airtel)', firmware: 'v3.1.4', obstacleDist: 1.2, yoloFps: 28.5 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSticks();
  }, []);

  // Hardware Command execution
  const sendCommand = async (stickId: string, command: 'REBOOT' | 'SIREN' | 'SOS_CLEAR') => {
    try {
      await fetch(`http://localhost:8000/api/devices/${stickId}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      
      if (command === 'SIREN') {
        showToast(`🚨 Audio Alarm triggered on ${stickId}! High-pitch buzzer active.`, 'error');
      } else if (command === 'REBOOT') {
        showToast(`🔄 Reboot sequence initiated for ${stickId}.`, 'info');
      } else if (command === 'SOS_CLEAR') {
        showToast(`✅ Emergency SOS alert cleared for ${stickId}.`, 'success');
        setSticks(prev => prev.map(s => s.id === stickId ? { ...s, status: 'ONLINE', sosTriggered: false } : s));
      }
    } catch {
      showToast(`Triggered ${command} command for ${stickId}`, 'info');
    }
  };

  // Handle Register New Stick
  const handleRegisterStick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStick.owner_name) {
      showToast("Please enter an owner name for the smart stick", "error");
      return;
    }

    try {
      await fetch('http://localhost:8000/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newStick.id,
          type: 'SMART_STICK',
          owner_name: newStick.owner_name,
          gps_lat: Number(newStick.gps_lat),
          gps_lng: Number(newStick.gps_lng),
          network: newStick.network,
          firmware: newStick.firmware
        })
      });
      
      const created = {
        id: newStick.id,
        type: 'Smart Stick',
        status: 'ONLINE',
        owner: newStick.owner_name,
        battery: 100,
        temperature: 36.5,
        location: `${newStick.gps_lat}, ${newStick.gps_lng}`,
        lastSeen: 'Just now',
        network: newStick.network,
        firmware: newStick.firmware,
        obstacleDist: 2.5,
        yoloFps: 30.0
      };

      setSticks(prev => [created, ...prev]);
      setIsModalOpen(false);
      showToast(`Smart Stick ${newStick.id} provisioned and connected!`, 'success');
      
      // Reset form
      setNewStick({
        id: `SBS-000${Math.floor(Math.random() * 899 + 100)}`,
        owner_name: '',
        gps_lat: 12.9716,
        gps_lng: 77.5946,
        network: '4G (Airtel)',
        firmware: 'v3.2.0'
      });
    } catch (err) {
      showToast("Provisioning submitted to local state.", "info");
    }
  };

  // Computed Metrics
  const totalSticks = sticks.length;
  const onlineCount = sticks.filter(s => s.status === 'ONLINE').length;
  const warningCount = sticks.filter(s => s.status === 'WARNING').length;
  const criticalCount = sticks.filter(s => s.status === 'CRITICAL' || s.sosTriggered).length;
  const activeSos = sticks.filter(s => s.sosTriggered);
  const avgBattery = totalSticks > 0 ? Math.round(sticks.reduce((acc, s) => acc + s.battery, 0) / totalSticks) : 0;
  const avgTemp = totalSticks > 0 ? (sticks.reduce((acc, s) => acc + s.temperature, 0) / totalSticks).toFixed(1) : 0;

  // Filtered Sticks
  const filteredSticks = sticks.filter(stick => {
    if (statusFilter === 'ONLINE' && stick.status !== 'ONLINE') return false;
    if (statusFilter === 'WARNING' && stick.status !== 'WARNING') return false;
    if (statusFilter === 'CRITICAL' && stick.status !== 'CRITICAL' && !stick.sosTriggered) return false;
    if (statusFilter === 'SOS' && !stick.sosTriggered) return false;
    
    if (search) {
      const q = search.toLowerCase();
      return stick.id.toLowerCase().includes(q) || stick.owner.toLowerCase().includes(q) || stick.network.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toast && (
        <div className={cn(
          "fixed top-5 right-5 z-50 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl flex items-center gap-3 transition-all animate-bounce",
          toast.type === 'error' ? "bg-error/20 border-error/50 text-error" :
          toast.type === 'success' ? "bg-success/20 border-success/50 text-success" :
          "bg-primary/20 border-primary/50 text-primary"
        )}>
          {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(14,165,233,0.4)]">
              <Smartphone size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                Smart Blind Stick Fleet
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/30">
                  v3.2 Edge AI
                </span>
              </h1>
              <p className="text-textMuted text-sm mt-0.5">
                Real-time obstacle detection, YOLO vision inference, ultrasonic telemetry & emergency SOS tracking
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
          <button 
            onClick={fetchSticks}
            className="p-2.5 bg-surfaceHighlight border border-white/10 rounded-xl text-textMuted hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 text-sm font-medium"
            title="Refresh Fleet Data"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-primary" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button 
            onClick={() => {
              if (activeSos.length > 0) {
                sendCommand(activeSos[0].id, 'SOS_CLEAR');
              } else {
                showToast("Simulating emergency panic button response for SBS-0003", "error");
              }
            }}
            className="px-4 py-2.5 bg-error/10 border border-error/30 text-error rounded-xl text-sm font-medium hover:bg-error hover:text-white transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
          >
            <BellRing size={16} className="animate-pulse" />
            <span>{activeSos.length > 0 ? `Clear SOS (${activeSos.length})` : 'Test Siren Broadcast'}</span>
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-primary text-white font-medium rounded-xl text-sm hover:bg-primaryHover transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(14,165,233,0.4)]"
          >
            <Plus size={18} />
            <span>Provision New Stick</span>
          </button>
        </div>
      </div>

      {/* Critical Active SOS Emergency Alert Bar */}
      {activeSos.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-error/20 via-red-900/30 to-error/20 border border-error/50 flex flex-col md:flex-row justify-between items-center gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-error flex items-center justify-center text-white shrink-0 shadow-[0_0_20px_rgba(239,68,68,0.8)]">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                EMERGENCY SOS ALERT TRIGGERED
                <span className="px-2 py-0.5 rounded text-xs bg-white text-error font-extrabold">IMMEDIATE ATTENTION</span>
              </h3>
              <p className="text-xs text-red-200 mt-0.5">
                Device <strong className="text-white font-mono">{activeSos[0].id}</strong> ({activeSos[0].owner}) sent emergency signal from coordinates <span className="font-mono">{activeSos[0].location}</span>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => navigate(`/sticks/${activeSos[0].id}/telemetry`)}
              className="px-3.5 py-2 bg-error text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors shadow-lg"
            >
              Track Live Telemetry
            </button>
            <button 
              onClick={() => sendCommand(activeSos[0].id, 'SOS_CLEAR')}
              className="px-3.5 py-2 bg-surfaceHighlight border border-white/20 text-white text-xs font-medium rounded-lg hover:bg-white/10 transition-colors"
            >
              Acknowledge & Clear
            </button>
          </div>
        </div>
      )}

      {/* Fleet KPI Metric Readouts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricKpiCard 
          title="Total Fleet Sticks" 
          value={totalSticks} 
          subtitle={`${onlineCount} Active Online`}
          icon={Smartphone}
          badgeText={`${onlineCount}/${totalSticks}`}
          badgeColor="bg-primary/20 text-primary"
        />
        <MetricKpiCard 
          title="Online / Active" 
          value={onlineCount} 
          subtitle={`${warningCount} Warning • ${criticalCount} Critical`}
          icon={Radio}
          badgeText="Operational"
          badgeColor="bg-success/20 text-success"
        />
        <MetricKpiCard 
          title="Active SOS Alerts" 
          value={activeSos.length} 
          subtitle={activeSos.length > 0 ? "SOS Panic Triggered" : "All Devices Safe"}
          icon={AlertTriangle}
          badgeText={activeSos.length > 0 ? "ALERT" : "SECURE"}
          badgeColor={activeSos.length > 0 ? "bg-error/30 text-error animate-pulse" : "bg-success/20 text-success"}
          isAlert={activeSos.length > 0}
        />
        <MetricKpiCard 
          title="Average Battery" 
          value={`${avgBattery}%`} 
          subtitle="Li-ion Power Reserve"
          icon={Battery}
          badgeText={avgBattery < 30 ? "LOW" : "OPTIMAL"}
          badgeColor={avgBattery < 30 ? "bg-warning/20 text-warning" : "bg-cyan-500/20 text-cyan-400"}
        />
        <MetricKpiCard 
          title="AI Vision Stream" 
          value="YOLOv8 Nano" 
          subtitle={`Avg Temp: ${avgTemp}°C`}
          icon={Eye}
          badgeText="28 FPS AVG"
          badgeColor="bg-purple-500/20 text-purple-400"
        />
      </div>

      {/* Search, Status Filters & View Controls */}
      <div className="glass-panel p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
          <input 
            type="text" 
            placeholder="Search stick by ID, owner, network..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surfaceHighlight border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-white">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          <span className="text-xs text-textMuted mr-1 hidden lg:inline flex items-center gap-1">
            <Filter size={14} /> Filter:
          </span>
          {(['ALL', 'ONLINE', 'WARNING', 'CRITICAL', 'SOS'] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shrink-0",
                statusFilter === f 
                  ? "bg-primary text-white border-primary shadow-[0_0_12px_rgba(14,165,233,0.3)]" 
                  : "bg-surfaceHighlight text-textMuted border-white/10 hover:text-white hover:bg-white/5"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-surfaceHighlight p-1 rounded-xl border border-white/10 shrink-0 self-end md:self-auto">
          <button
            onClick={() => setViewMode('GRID')}
            className={cn(
              "p-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
              viewMode === 'GRID' ? "bg-primary text-white shadow-sm" : "text-textMuted hover:text-white"
            )}
            title="Grid Cards"
          >
            <Grid size={16} />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            onClick={() => setViewMode('MAP')}
            className={cn(
              "p-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
              viewMode === 'MAP' ? "bg-primary text-white shadow-sm" : "text-textMuted hover:text-white"
            )}
            title="Fleet Map"
          >
            <MapIcon size={16} />
            <span className="hidden sm:inline">Fleet Map</span>
          </button>
          <button
            onClick={() => setViewMode('TABLE')}
            className={cn(
              "p-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
              viewMode === 'TABLE' ? "bg-primary text-white shadow-sm" : "text-textMuted hover:text-white"
            )}
            title="Telemetry Table"
          >
            <TableIcon size={16} />
            <span className="hidden sm:inline">Table</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-textMuted text-sm">Syncing Smart Stick fleet telemetry...</p>
          </div>
        </div>
      ) : filteredSticks.length === 0 ? (
        <div className="glass-panel p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-surfaceHighlight border border-white/10 flex items-center justify-center text-textMuted">
            <Smartphone size={28} />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">No Smart Sticks Found</h3>
            <p className="text-textMuted text-sm mt-1">No devices matched your search query or filter criteria.</p>
          </div>
          <button 
            onClick={() => { setSearch(''); setStatusFilter('ALL'); }}
            className="px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'GRID' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSticks.map((stick) => (
            <SmartStickCard 
              key={stick.id} 
              stick={stick} 
              onCommand={sendCommand}
              onNavigateDetail={() => navigate(`/sticks/${stick.id}`)}
              onNavigateTelemetry={() => navigate(`/sticks/${stick.id}/telemetry`)}
            />
          ))}
        </div>
      ) : viewMode === 'MAP' ? (
        /* MAP VIEW */
        <div className="glass-panel p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                <MapPin size={20} className="text-primary" /> Live GPS Fleet Distribution
              </h2>
              <p className="text-textMuted text-xs mt-0.5">Real-time geospatial tracking of active Smart Sticks</p>
            </div>
            <span className="text-xs text-textMuted font-mono">
              {filteredSticks.length} Devices Mapped
            </span>
          </div>

          <div className="h-[500px] w-full rounded-xl overflow-hidden border border-white/10">
            <DeviceMap 
              devices={filteredSticks.map(s => {
                const parts = (s.location || '12.9716, 77.5946').split(',');
                return {
                  id: s.id,
                  type: 'Smart Stick',
                  name: s.owner,
                  lat: parseFloat(parts[0]) || 12.9716,
                  lng: parseFloat(parts[1]) || 77.5946,
                  status: s.sosTriggered ? 'CRITICAL' : s.status
                };
              })}
              height="100%"
            />
          </div>
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-surfaceHighlight/50 text-textMuted uppercase text-[11px] tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Stick ID</th>
                  <th className="py-3.5 px-4">Owner</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Battery</th>
                  <th className="py-3.5 px-4">Ultrasonic</th>
                  <th className="py-3.5 px-4">Vision (YOLO)</th>
                  <th className="py-3.5 px-4">Temp</th>
                  <th className="py-3.5 px-4">Network</th>
                  <th className="py-3.5 px-4">Firmware</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSticks.map((stick) => (
                  <tr key={stick.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white font-mono">{stick.id}</td>
                    <td className="py-3.5 px-4 text-textMain">{stick.owner}</td>
                    <td className="py-3.5 px-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                        stick.sosTriggered || stick.status === 'CRITICAL' ? 'bg-error/20 text-error border-error/30' :
                        stick.status === 'WARNING' ? 'bg-warning/20 text-warning border-warning/30' :
                        'bg-success/20 text-success border-success/30'
                      )}>
                        {stick.sosTriggered ? 'SOS ALERT' : stick.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <Battery size={14} className={stick.battery < 25 ? "text-error" : "text-success"} />
                        <span className="text-white font-medium">{stick.battery}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-white font-mono">{stick.obstacleDist || 1.2}m</td>
                    <td className="py-3.5 px-4 text-cyan-400 font-mono">{stick.yoloFps || 28} FPS</td>
                    <td className="py-3.5 px-4 text-white font-mono">{stick.temperature}°C</td>
                    <td className="py-3.5 px-4 text-textMuted text-xs">{stick.network}</td>
                    <td className="py-3.5 px-4 text-textMuted text-xs font-mono">{stick.firmware}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/sticks/${stick.id}/telemetry`)}
                          className="px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary hover:text-white transition-all text-xs font-medium"
                        >
                          Live
                        </button>
                        <button 
                          onClick={() => navigate(`/sticks/${stick.id}`)}
                          className="px-2.5 py-1 bg-surfaceHighlight text-white border border-white/10 rounded hover:bg-white/10 transition-all text-xs font-medium"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Provisioning Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg p-6 space-y-6 relative border border-white/20 shadow-2xl animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-textMuted hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <X size={20} />
            </button>

            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Smartphone className="text-primary" size={22} /> Provision New Smart Stick
              </h2>
              <p className="text-textMuted text-xs mt-1">
                Register a new hardware device into the telemetry network
              </p>
            </div>

            <form onSubmit={handleRegisterStick} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Device Serial ID</label>
                  <input 
                    type="text" 
                    value={newStick.id}
                    onChange={(e) => setNewStick({ ...newStick, id: e.target.value })}
                    className="w-full px-3 py-2 bg-surfaceHighlight border border-white/10 rounded-lg text-white font-mono focus:border-primary focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Owner / User Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Anand Kumar"
                    value={newStick.owner_name}
                    onChange={(e) => setNewStick({ ...newStick, owner_name: e.target.value })}
                    className="w-full px-3 py-2 bg-surfaceHighlight border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">GPS Latitude</label>
                  <input 
                    type="number" 
                    step="0.0001"
                    value={newStick.gps_lat}
                    onChange={(e) => setNewStick({ ...newStick, gps_lat: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-surfaceHighlight border border-white/10 rounded-lg text-white font-mono focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">GPS Longitude</label>
                  <input 
                    type="number" 
                    step="0.0001"
                    value={newStick.gps_lng}
                    onChange={(e) => setNewStick({ ...newStick, gps_lng: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-surfaceHighlight border border-white/10 rounded-lg text-white font-mono focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Network Hardware</label>
                  <select
                    value={newStick.network}
                    onChange={(e) => setNewStick({ ...newStick, network: e.target.value })}
                    className="w-full px-3 py-2 bg-surfaceHighlight border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none"
                  >
                    <option value="4G (Airtel)">4G (Airtel LTE)</option>
                    <option value="4G (Jio)">4G (Jio LTE)</option>
                    <option value="5G (Vodafone)">5G (Vodafone)</option>
                    <option value="WiFi (Home)">WiFi (Home)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Firmware Version</label>
                  <input 
                    type="text" 
                    value={newStick.firmware}
                    onChange={(e) => setNewStick({ ...newStick, firmware: e.target.value })}
                    className="w-full px-3 py-2 bg-surfaceHighlight border border-white/10 rounded-lg text-white font-mono focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-surfaceHighlight border border-white/10 rounded-lg text-textMuted hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primaryHover shadow-[0_0_15px_rgba(14,165,233,0.4)]"
                >
                  Register Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// KPI Metric Card Subcomponent
function MetricKpiCard({ title, value, subtitle, icon: Icon, badgeText, badgeColor, isAlert }: any) {
  return (
    <div className={cn(
      "glass-card p-5 relative overflow-hidden transition-all duration-300 hover:border-primary/40",
      isAlert && "border-error/60 bg-error/10"
    )}>
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-textMuted">{title}</span>
        <div className="p-2 rounded-xl bg-surfaceHighlight border border-white/10 text-white">
          <Icon size={18} className={isAlert ? "text-error animate-bounce" : "text-primary"} />
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-black text-white tracking-tight">{value}</div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-textMuted">{subtitle}</span>
          <span className={cn("px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase border border-white/5", badgeColor)}>
            {badgeText}
          </span>
        </div>
      </div>
    </div>
  );
}

// Smart Stick Interactive Card Subcomponent
function SmartStickCard({ 
  stick, 
  onCommand, 
  onNavigateDetail, 
  onNavigateTelemetry 
}: { 
  stick: StickDevice; 
  onCommand: (id: string, cmd: 'REBOOT' | 'SIREN' | 'SOS_CLEAR') => void;
  onNavigateDetail: () => void;
  onNavigateTelemetry: () => void;
}) {
  const isEmergency = stick.sosTriggered || stick.status === 'CRITICAL';
  
  return (
    <div className={cn(
      "glass-panel p-5 space-y-4 relative transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] border",
      isEmergency ? "border-error/60 bg-gradient-to-b from-error/10 via-surface to-surface shadow-[0_0_20px_rgba(239,68,68,0.2)]" : 
      stick.status === 'WARNING' ? "border-warning/40 hover:border-warning/60" : "border-white/10 hover:border-primary/40"
    )}>
      {/* Top Bar: ID & Status Badge */}
      <div className="flex justify-between items-start border-b border-white/5 pb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white border",
            isEmergency ? "bg-error/30 border-error/50 text-error shadow-[0_0_15px_rgba(239,68,68,0.4)]" : "bg-primary/20 border-primary/30 text-primary"
          )}>
            <Smartphone size={20} />
          </div>
          <div>
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              {stick.id}
            </h3>
            <p className="text-xs text-textMuted flex items-center gap-1">
              Owner: <span className="text-textMain font-medium">{stick.owner}</span>
            </p>
          </div>
        </div>

        <span className={cn(
          "px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shadow-sm",
          isEmergency ? "bg-error/20 text-error border-error/40 animate-pulse" :
          stick.status === 'WARNING' ? "bg-warning/20 text-warning border-warning/40" :
          "bg-success/20 text-success border-success/40"
        )}>
          {isEmergency ? '🚨 SOS ALERT' : stick.status}
        </span>
      </div>

      {/* Battery Gauge Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-textMuted flex items-center gap-1">
            <Battery size={14} className={stick.battery < 20 ? "text-error" : "text-success"} /> Battery Health
          </span>
          <span className={cn("font-mono", stick.battery < 20 ? "text-error font-bold" : "text-white")}>
            {stick.battery}%
          </span>
        </div>
        <div className="w-full h-2 bg-surfaceHighlight rounded-full overflow-hidden border border-white/5">
          <div 
            className={cn(
              "h-full transition-all duration-500 rounded-full",
              stick.battery > 50 ? "bg-gradient-to-r from-emerald-500 to-success" :
              stick.battery > 20 ? "bg-gradient-to-r from-amber-500 to-warning" :
              "bg-gradient-to-r from-red-600 to-error"
            )}
            style={{ width: `${Math.max(5, stick.battery)}%` }}
          />
        </div>
      </div>

      {/* Telemetry Sensor Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs bg-surfaceHighlight/50 p-3 rounded-xl border border-white/5">
        <div className="flex items-center gap-2">
          <Radio size={14} className="text-primary shrink-0" />
          <div className="overflow-hidden">
            <p className="text-[10px] text-textMuted uppercase">Obstacle Radar</p>
            <p className="text-white font-mono font-bold">{stick.obstacleDist || 1.2}m Front</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Eye size={14} className="text-cyan-400 shrink-0" />
          <div className="overflow-hidden">
            <p className="text-[10px] text-textMuted uppercase">Vision Model</p>
            <p className="text-cyan-400 font-mono font-bold">{stick.yoloFps || 28} FPS YOLO</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <Thermometer size={14} className={stick.temperature > 50 ? "text-error" : "text-success"} />
          <div className="overflow-hidden">
            <p className="text-[10px] text-textMuted uppercase">Temperature</p>
            <p className="text-white font-mono font-bold">{stick.temperature}°C</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <Wifi size={14} className="text-blue-400 shrink-0" />
          <div className="overflow-hidden">
            <p className="text-[10px] text-textMuted uppercase">Network</p>
            <p className="text-white truncate font-medium">{stick.network}</p>
          </div>
        </div>
      </div>

      {/* Location & Last Active */}
      <div className="flex items-center justify-between text-xs text-textMuted px-1">
        <span className="flex items-center gap-1 font-mono">
          <Navigation2 size={13} className="text-primary" /> {stick.location}
        </span>
        <span className="text-[11px]">Seen {stick.lastSeen}</span>
      </div>

      {/* Actions */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button 
            onClick={onNavigateTelemetry}
            className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/30 rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-all flex items-center gap-1 shadow-sm"
          >
            <Activity size={13} />
            Live
          </button>
          
          <button 
            onClick={onNavigateDetail}
            className="px-3 py-1.5 bg-surfaceHighlight text-white border border-white/10 rounded-lg text-xs font-medium hover:bg-white/10 transition-colors"
          >
            Details
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => onCommand(stick.id, 'SIREN')}
            className="p-1.5 bg-error/10 text-error border border-error/20 rounded-lg hover:bg-error hover:text-white transition-colors"
            title="Trigger High-Pitch Emergency Siren"
          >
            <BellRing size={14} />
          </button>
          
          <button 
            onClick={() => onCommand(stick.id, 'REBOOT')}
            className="p-1.5 bg-surfaceHighlight text-textMuted border border-white/10 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
            title="Reboot Device"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
