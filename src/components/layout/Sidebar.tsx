import { NavLink, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  Cpu,
  Smartphone,
  Store,
  Package,
  CreditCard,
  Bell,
  Terminal,
  LineChart,
  Users,
  Settings,
  Wifi,
  Cloud,
  X,
  LogOut
} from 'lucide-react';

const adminNavItems = [
  { name: 'All Devices', to: '/devices', icon: Cpu },
  { name: 'Logs', to: '/logs', icon: Terminal },
  { name: 'Settings', to: '/settings', icon: Settings },
];

const vendorNavItems = [
  { name: 'Overview', to: '/', icon: LayoutDashboard },
  { name: 'All Devices', to: '/devices', icon: Cpu },
  { name: 'Smart Sticks', to: '/sticks', icon: Smartphone },
  { name: 'Shop Units', to: '/shops', icon: Store },
  { name: 'Users / Vendors', to: '/users', icon: Users },
  { name: 'Transactions', to: '/transactions', icon: CreditCard },
  { name: 'Alerts', to: '/alerts', icon: Bell },
  { name: 'Inventory', to: '/inventory', icon: Package },
  { name: 'Analytics', to: '/analytics', icon: LineChart },
  { name: 'Settings', to: '/settings', icon: Settings },
];

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const navItems = user?.role === 'ADMIN' ? adminNavItems : vendorNavItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 flex flex-col bg-surface border-r border-white/5 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:shrink-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
              <span className="text-primary font-bold text-xl">S</span>
            </div>
            <div>
              <h1 className="text-white font-bold tracking-tight leading-none">SMART STICK</h1>
              <p className="text-[10px] text-textMuted uppercase tracking-widest mt-0.5">Platform</p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-textMuted hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive && item.to === window.location.pathname
                    ? "bg-primary/10 text-primary"
                    : "text-textMuted hover:bg-surfaceHighlight hover:text-textMain"
                )
              }
            >
              <item.icon size={18} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Footer / System Status */}
        <div className="shrink-0 border-t border-white/5 p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-textMuted flex items-center gap-1.5">
                <Cloud size={14} /> Cloud Connected
              </span>
              <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-textMuted flex items-center gap-1.5">
                <Wifi size={14} /> MQTT Connected
              </span>
              <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
            </div>
          </div>

          <div className="flex items-center justify-between bg-surfaceHighlight p-3 rounded-xl border border-white/5">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center text-white font-bold shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-textMuted truncate">{user?.role || 'Guest'}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 text-textMuted hover:text-error hover:bg-error/10 rounded-lg transition-colors shrink-0"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
