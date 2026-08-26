import { useState, useEffect } from 'react';
import { CreditCard, Search, Filter, ArrowRight, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppStore } from '../store/useAppStore';

export function Transactions() {
  const [search, setSearch] = useState('');
  const [selectedTx, setSelectedTx] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (useAppStore.getState().isDemoMode) {
          const { mockTransactions } = await import('../lib/mockData');
          setTransactions(mockTransactions);
        } else {
          const res = await fetch('http://localhost:8000/api/transactions');
          const data = await res.json();
          setTransactions(data);
        }
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
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

  const filtered = transactions.filter(tx => 
    tx.id.toLowerCase().includes(search.toLowerCase()) || 
    (tx.device && tx.device.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard size={24} className="text-primary" /> Transactions & Payments
          </h1>
          <p className="text-textMuted mt-1">Monitor live transactions and payment reconciliation</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
            <input 
              type="text" 
              placeholder="Search TXN ID or Shop..."
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions Table */}
        <div className={cn("glass-panel overflow-hidden transition-all", selectedTx ? "lg:col-span-2" : "lg:col-span-3")}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-surfaceHighlight/30 text-textMuted">
                  <th className="py-4 px-4 font-medium">Transaction ID</th>
                  <th className="py-4 px-4 font-medium">Shop</th>
                  <th className="py-4 px-4 font-medium">Product</th>
                  <th className="py-4 px-4 font-medium text-right">Amount</th>
                  <th className="py-4 px-4 font-medium text-center">Status</th>
                  <th className="py-4 px-4 font-medium text-right">Time</th>
                  {!selectedTx && <th className="py-4 px-4 font-medium text-right">Action</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-textMuted">Loading transactions...</td>
                  </tr>
                ) : filtered.map((tx) => (
                  <tr 
                    key={tx.id} 
                    onClick={() => setSelectedTx(tx.id)}
                    className={cn(
                      "border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer group",
                      selectedTx === tx.id ? "bg-primary/5 border-l-2 border-l-primary" : "border-l-2 border-l-transparent"
                    )}
                  >
                    <td className="py-3 px-4 font-medium text-white">{tx.id}</td>
                    <td className="py-3 px-4 text-textMuted">{tx.device}</td>
                    <td className="py-3 px-4 text-white">{tx.items[0]}</td>
                    <td className="py-3 px-4 text-right font-medium text-white">{tx.amount}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold tracking-wider",
                        tx.status === 'COMPLETED' ? 'bg-success/10 text-success' :
                        tx.status === 'PAYMENT_PENDING' ? 'bg-warning/10 text-warning' :
                        tx.status === 'DISPENSE_FAILED' ? 'bg-error/10 text-error' : 'bg-gray-500/10 text-gray-400'
                      )}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-textMuted text-xs">{tx.time}</td>
                    {!selectedTx && (
                      <td className="py-3 px-4 text-right">
                        <button className="text-primary hover:text-primaryHover opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transaction Timeline / Detail View */}
        {selectedTx && (
          <div className="glass-panel p-5 animate-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Transaction Timeline</h2>
              <button 
                onClick={() => setSelectedTx(null)}
                className="text-textMuted hover:text-white"
              >
                Close
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-surfaceHighlight/30 rounded-xl border border-white/5 space-y-2">
              <div className="flex justify-between">
                <span className="text-textMuted text-sm">Order</span>
                <span className="text-white font-medium">{selectedTx}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textMuted text-sm">Amount</span>
                <span className="text-white font-medium">{transactions.find(t=>t.id===selectedTx)?.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textMuted text-sm">Product</span>
                <span className="text-white font-medium">{transactions.find(t=>t.id===selectedTx)?.items[0]}</span>
              </div>
            </div>

            <div className="relative border-l border-white/10 ml-3 space-y-6">
              <TimelineEvent time="10:31:04" event="ORDER_CREATED" status="success" />
              <TimelineEvent time="10:31:09" event="PAYMENT_VERIFIED" status="success" />
              <TimelineEvent time="10:31:10" event="DISPENSE_AUTHORIZED" status="success" />
              
              {transactions.find(t=>t.id===selectedTx)?.status === 'Failed' ? (
                <TimelineEvent time="10:31:13" event="DISPENSE_FAILED" status="error" message="Motor jammed. Refund queued." />
              ) : transactions.find(t=>t.id===selectedTx)?.status === 'Pending' ? (
                <TimelineEvent time="10:31:13" event="PAYMENT_PENDING" status="pending" message="Waiting for UPI callback." />
              ) : (
                <>
                  <TimelineEvent time="10:31:13" event="DISPENSE_CONFIRMED" status="success" />
                  <TimelineEvent time="10:31:14" event="COMPLETED" status="success" />
                </>
              )}
            </div>
            
            <div className="mt-8 pt-4 border-t border-white/5 flex gap-2">
              <button className="flex-1 py-2 bg-surfaceHighlight text-white rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
                View Receipt
              </button>
              {transactions.find(t=>t.id===selectedTx)?.status === 'Failed' && (
                <button className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primaryHover transition-colors">
                  Process Refund
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineEvent({ time, event, status, message }: { time: string, event: string, status: 'success'|'pending'|'error', message?: string }) {
  return (
    <div className="relative pl-6">
      <div className={cn(
        "absolute w-4 h-4 rounded-full -left-2 top-0.5 border-2 flex items-center justify-center bg-surface",
        status === 'success' ? "border-success text-success" :
        status === 'pending' ? "border-warning text-warning" : "border-error text-error"
      )}>
        {status === 'success' ? <CheckCircle2 size={10} /> : status === 'pending' ? <Clock size={10} /> : <AlertTriangle size={10} />}
      </div>
      <p className="text-xs text-textMuted mb-0.5 font-mono">{time}</p>
      <p className={cn("text-sm font-bold", status === 'success' ? "text-white" : status === 'pending' ? "text-warning" : "text-error")}>
        {event}
      </p>
      {message && <p className="text-sm text-textMuted mt-1">{message}</p>}
    </div>
  );
}
