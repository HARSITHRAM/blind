import { Menu, Activity, Beaker, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useMqttStore } from '../../store/useMqttStore';
import { cn } from '../../lib/utils';

export function Header() {
  const { setSidebarOpen, isDemoMode, toggleDemoMode } = useAppStore();
  const { status } = useMqttStore();

  return (
    <header className="h-16 border-b border-white/5 bg-surface/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 -ml-2 text-textMuted hover:text-white rounded-lg hover:bg-surfaceHighlight"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:flex items-center gap-2">
          {!isDemoMode ? (
            <div className="flex items-center gap-2">
              {status === 'CONNECTED' ? <Wifi size={18} className="text-success" /> : 
               status === 'CONNECTING' ? <Loader2 size={18} className="text-warning animate-spin" /> : 
               <WifiOff size={18} className="text-error" />}
              <span className="text-sm font-medium text-textMuted">MQTT: <span className={cn(
                "font-semibold",
                status === 'CONNECTED' ? "text-success" : status === 'CONNECTING' ? "text-warning" : "text-error"
              )}>{status}</span></span>
            </div>
          ) : (
            <>
              <Activity size={18} className="text-primary" />
              <span className="text-sm font-medium text-textMuted">System Status: <span className="text-success font-semibold">Healthy (Demo)</span></span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleDemoMode}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 border",
            isDemoMode
              ? "bg-warning/20 text-warning border-warning/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
              : "bg-surfaceHighlight text-textMuted border-white/10 hover:text-white hover:border-white/20"
          )}
        >
          <Beaker size={14} />
          {isDemoMode ? 'Demo Mode Active' : 'Live Mode'}
        </button>
      </div>
    </header>
  );
}
