import { useState } from 'react';
import { Settings as SettingsIcon, Key, Globe, Shield, Save, Bell, Smartphone } from 'lucide-react';
import { cn } from '../lib/utils';

export function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'Organization', icon: Globe },
    { id: 'security', label: 'Security & API', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'devices', label: 'Device Defaults', icon: Smartphone },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <SettingsIcon size={24} className="text-primary" /> System Settings
          </h1>
          <p className="text-textMuted mt-1">Manage organization preferences and API configurations</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primaryHover rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(14,165,233,0.3)]">
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                activeTab === tab.id 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "text-textMuted hover:bg-surfaceHighlight hover:text-white border border-transparent"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 glass-panel p-6 min-h-[500px]">
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-3">Organization Settings</h2>
              
              <div className="space-y-4 max-w-2xl">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-textMuted">Organization Name</label>
                  <input type="text" defaultValue="Mivo Tech Inc." className="w-full px-4 py-2 bg-surfaceHighlight border border-white/10 rounded-lg text-white focus:border-primary/50 focus:outline-none" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-textMuted">Support Email</label>
                  <input type="email" defaultValue="support@mivo.in" className="w-full px-4 py-2 bg-surfaceHighlight border border-white/10 rounded-lg text-white focus:border-primary/50 focus:outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-textMuted">Timezone</label>
                  <select className="w-full px-4 py-2 bg-surfaceHighlight border border-white/10 rounded-lg text-white focus:border-primary/50 focus:outline-none">
                    <option>Asia/Kolkata (IST)</option>
                    <option>UTC</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-3">Security & API Configuration</h2>
              
              <div className="space-y-6 max-w-2xl">
                <div className="p-4 bg-surfaceHighlight/30 border border-white/5 rounded-xl space-y-4">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Key size={18} className="text-primary" /> API Keys
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-textMuted uppercase tracking-wider">Production Key</label>
                    <div className="flex gap-2">
                      <input type="password" value="sk_live_1234567890abcdef" readOnly className="flex-1 px-4 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white font-mono text-sm opacity-50 cursor-not-allowed" />
                      <button className="px-4 py-2 bg-surfaceHighlight text-white border border-white/10 rounded-lg text-sm hover:bg-white/5 transition-colors">Reveal</button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-surfaceHighlight/30 border border-white/5 rounded-xl space-y-4">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Globe size={18} className="text-primary" /> Webhooks
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-textMuted uppercase tracking-wider">Transaction Endpoint URL</label>
                    <input type="url" placeholder="https://api.yourdomain.com/webhooks/transactions" className="w-full px-4 py-2 bg-surfaceHighlight border border-white/10 rounded-lg text-white focus:border-primary/50 focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {(activeTab === 'notifications' || activeTab === 'devices') && (
            <div className="flex flex-col items-center justify-center h-full text-textMuted py-20">
              <SettingsIcon size={48} className="opacity-20 mb-4" />
              <p>Settings panel for {activeTab} is under construction.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
