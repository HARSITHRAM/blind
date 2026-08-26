import { useState, useEffect } from 'react';
import { Users as UsersIcon, Search, UserPlus, Shield, MoreVertical } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppStore } from '../store/useAppStore';

export function Users() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        let data;
        if (useAppStore.getState().isDemoMode) {
          const { mockUsers } = await import('../lib/mockData');
          data = mockUsers;
        } else {
          const res = await fetch('http://localhost:8000/api/users');
          data = await res.json();
        }
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
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

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <UsersIcon size={24} className="text-primary" /> Users & Access Control
          </h1>
          <p className="text-textMuted mt-1">Manage dashboard operators and roles</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
            <input 
              type="text" 
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surfaceHighlight border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primaryHover rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(14,165,233,0.3)]">
            <UserPlus size={16} /> Invite User
          </button>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-surfaceHighlight/30 text-textMuted">
                <th className="py-4 px-4 font-medium">User</th>
                <th className="py-4 px-4 font-medium">Role</th>
                <th className="py-4 px-4 font-medium">Status</th>
                <th className="py-4 px-4 font-medium">Last Login</th>
                <th className="py-4 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-textMuted">Loading users...</td>
                </tr>
              ) : filtered.map(user => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-medium text-white">{user.name}</div>
                    <div className="text-xs text-textMuted">{user.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1.5 w-max px-2.5 py-1 bg-surfaceHighlight border border-white/10 rounded text-[11px] font-bold tracking-wider text-white">
                      <Shield size={12} className={user.role === 'SUPER_ADMIN' ? 'text-error' : 'text-primary'} />
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold tracking-wider",
                      user.status === 'ACTIVE' ? "bg-success/10 text-success" : "bg-gray-500/20 text-gray-400"
                    )}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-textMuted text-xs">
                    {user.lastLogin}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="p-1 text-textMuted hover:text-white transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
