import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Battery, Smartphone, Store, Thermometer, Wifi, Search, Filter } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppStore } from '../store/useAppStore';

type Tab = 'All Devices' | 'Smart Sticks' | 'Shop Units';

export function Devices() {
  const [activeTab, setActiveTab] = useState<Tab>('All Devices');
  const [search, setSearch] = useState('');
  const [allDevices, setAllDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (useAppStore.getState().isDemoMode) {
          const { mockDevices } = await import('../lib/mockData');
          setAllDevices(mockDevices);
        } else {
          const res = await fetch('http://localhost:8000/api/devices');
          const data = await res.json();
          setAllDevices(data);
        }
      } catch (err) {
        console.error("Failed to fetch devices:", err);
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

  const filteredDevices = allDevices.filter(d => {
    if (activeTab === 'Smart Sticks' && d.type !== 'Smart Stick') return false;
    if (activeTab === 'Shop Units' && d.type !== 'Shop Unit') return false;
    if (search && !d.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Device Management</h1>
          <p className="text-textMuted mt-1">Manage and monitor all connected hardware</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
            <input 
              type="text" 
              placeholder="Search by ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surfaceHighlight border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <button className="p-2 bg-surfaceHighlight border border-white/10 rounded-lg text-textMuted hover:text-white transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="flex border-b border-white/10 space-x-6">
        {(['All Devices', 'Smart Sticks', 'Shop Units'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "pb-3 text-sm font-medium transition-colors relative",
              activeTab === tab ? "text-primary" : "text-textMuted hover:text-white"
            )}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDevices.map(device => (
            <DeviceCard 
              key={device.id} 
              device={device} 
              onClick={() => {
                if (device.type === 'Smart Stick') {
                  navigate(`/sticks/${device.id}`);
                } else {
                  navigate(`/shops/${device.id}`);
                }
              }} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DeviceCard({ device, onClick }: { device: any, onClick: () => void }) {
  const isStick = device.type === 'Smart Stick';
  
  return (
    <div 
      onClick={onClick}
      className="glass-card p-5 cursor-pointer hover:border-primary/30 group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center border border-white/5">
            {isStick ? <Smartphone size={20} className="text-primary" /> : <Store size={20} className="text-cyan-400" />}
          </div>
          <div>
            <h3 className="text-white font-semibold flex items-center gap-2">
              {device.id}
              <span className={cn(
                "w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]",
                device.status === 'ONLINE' ? 'bg-success text-success' :
                device.status === 'WARNING' ? 'bg-warning text-warning' :
                device.status === 'CRITICAL' ? 'bg-error text-error' : 'bg-gray-500 text-gray-500'
              )}></span>
            </h3>
            <p className="text-xs text-textMuted">{device.owner}</p>
          </div>
        </div>
        <span className={cn(
          "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
          device.status === 'ONLINE' ? 'bg-success/10 text-success' :
          device.status === 'WARNING' ? 'bg-warning/10 text-warning' :
          device.status === 'CRITICAL' ? 'bg-error/10 text-error' : 'bg-gray-500/10 text-gray-500'
        )}>
          {device.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-4">
        {isStick && (
          <div className="flex items-center gap-2 text-sm text-textMuted">
            <Battery size={16} className={cn(
              device.battery > 20 ? "text-success" : "text-error"
            )} />
            <span className="text-white">{device.battery}%</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-textMuted">
          <Thermometer size={16} className={cn(
            device.temperature > 50 ? "text-error" : 
            device.temperature > 40 ? "text-warning" : "text-success"
          )} />
          <span className="text-white">{device.temperature}°C</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-textMuted">
          <Wifi size={16} className={device.network !== 'None' ? 'text-primary' : 'text-gray-500'} />
          <span className="text-white">{device.network}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-textMuted">
          <span className="font-mono text-xs">{device.firmware}</span>
        </div>
      </div>
      
      <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-textMuted">
        <span>Seen {device.lastSeen}</span>
        <span className="text-primary group-hover:underline">View details</span>
      </div>
    </div>
  );
}
