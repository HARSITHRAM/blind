import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Activity, 
  Package, 
  Settings, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle2,
  IndianRupee,
  CreditCard
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppStore } from '../store/useAppStore';

export function ShopDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        let data;
        if (useAppStore.getState().isDemoMode) {
          const { mockDevices } = await import('../lib/mockData');
          data = mockDevices;
        } else {
          const res = await fetch('http://localhost:8000/api/devices');
          data = await res.json();
        }
        const found = data.find((d: any) => d.id === id) || data.find((d: any) => d.type === 'Shop Unit') || data[0];
        setShop(found);
      } catch (err) {
        console.error("Failed to fetch shop:", err);
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
  }, [id]);

  if (loading || !shop) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const inventory = [
    { name: 'Water', sku: 'WATER-001', digital: 14, physical: 14, status: 'MATCH' },
    { name: 'Biscuits', sku: 'BISC-002', digital: 21, physical: 21, status: 'MATCH' },
    { name: 'Chips', sku: 'CHIP-003', digital: 12, physical: 10, status: 'MISMATCH' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
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
              <h1 className="text-2xl font-bold text-white">{shop.id}</h1>
              <span className={cn(
                "px-2.5 py-1 rounded-full text-xs font-bold tracking-wider",
                shop.status === 'ONLINE' ? 'bg-success/20 text-success border border-success/30' :
                shop.status === 'WARNING' ? 'bg-warning/20 text-warning border border-warning/30' :
                shop.status === 'CRITICAL' ? 'bg-error/20 text-error border border-error/30' : 
                'bg-gray-500/20 text-gray-400 border border-gray-500/30'
              )}>
                {shop.status}
              </span>
            </div>
            <p className="text-textMuted mt-1">{shop.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white border border-primary hover:bg-primaryHover hover:border-primaryHover rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(14,165,233,0.3)]">
            <RefreshCw size={16} /> Sync Stock
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="TODAY'S REVENUE" value="₹840" icon={IndianRupee} textClass="text-success" />
        <StatCard title="TRANSACTIONS" value="42" icon={CreditCard} />
        <StatCard title="CURRENT STOCK" value="47 items" icon={Package} />
        <StatCard title="PENDING ORDERS" value="0" icon={Activity} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hardware Status */}
        <div className="glass-panel p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
            <Settings size={18} className="text-gray-400" /> Hardware Status
          </h2>
          <div className="space-y-3">
            <DetailRow label="Dispensing Unit" value="READY" valueClass="text-success" />
            <DetailRow label="Motor Status" value="IDLE" />
            <DetailRow label="IR Sensors" value="ACTIVE" valueClass="text-success" />
            <DetailRow label="Temperature" value={`${shop.temperature}°C`} />
            <DetailRow label="Network" value={shop.network} />
            <DetailRow label="Firmware" value={shop.firmware} />
          </div>
        </div>

        {/* Physical vs Digital Stock */}
        <div className="lg:col-span-2 glass-panel p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
            <Package size={18} className="text-primary" /> Physical vs Digital Stock Reconciliation
          </h2>
          <div className="space-y-4">
            {inventory.map(item => (
              <div key={item.sku} className={cn(
                "p-4 rounded-xl border flex items-center justify-between",
                item.status === 'MATCH' ? "border-white/5 bg-surfaceHighlight/30" : "border-warning/30 bg-warning/10"
              )}>
                <div>
                  <h3 className="text-white font-medium">{item.name} <span className="text-xs text-textMuted ml-2">{item.sku}</span></h3>
                  <div className="flex items-center gap-6 mt-2 text-sm">
                    <span className="text-textMuted">Digital: <strong className="text-white">{item.digital}</strong></span>
                    <span className="text-textMuted">Physical: <strong className="text-white">{item.physical}</strong></span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.status === 'MATCH' ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-success bg-success/10 px-2.5 py-1 rounded-full">
                      <CheckCircle2 size={14} /> MATCH
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-warning bg-warning/10 px-2.5 py-1 rounded-full border border-warning/20">
                      <AlertTriangle size={14} /> MISMATCH
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, textClass = "text-white" }: any) {
  return (
    <div className="glass-card p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-textMuted tracking-wider">{title}</span>
        <Icon size={16} className="text-textMuted" />
      </div>
      <div className={cn("text-2xl font-bold", textClass)}>{value}</div>
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
