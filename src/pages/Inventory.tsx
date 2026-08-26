import { useState } from 'react';
import { Package, Search, Plus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface InventoryItem {
  id: string;
  product: string;
  sku: string;
  price: string;
  digitalStock: number;
  physicalStock: number;
  threshold: number;
  lastUpdated: string;
}

const mockInventory: InventoryItem[] = [
  { id: '1', product: 'Water Bottle', sku: 'WATER-001', price: '₹20', digitalStock: 14, physicalStock: 14, threshold: 5, lastUpdated: '10 mins ago' },
  { id: '2', product: 'Potato Chips', sku: 'CHIPS-001', price: '₹20', digitalStock: 12, physicalStock: 10, threshold: 5, lastUpdated: '2 hrs ago' },
  { id: '3', product: 'Biscuits', sku: 'BISC-001', price: '₹15', digitalStock: 25, physicalStock: 25, threshold: 10, lastUpdated: '1 hr ago' },
  { id: '4', product: 'Energy Drink', sku: 'EDRK-001', price: '₹40', digitalStock: 4, physicalStock: 4, threshold: 8, lastUpdated: '5 mins ago' },
];

export function Inventory() {
  const [search, setSearch] = useState('');

  const filtered = mockInventory.filter(item => 
    item.product.toLowerCase().includes(search.toLowerCase()) || 
    item.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package size={24} className="text-primary" /> Global Inventory
          </h1>
          <p className="text-textMuted mt-1">Manage products and monitor physical stock reconciliation</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
            <input 
              type="text" 
              placeholder="Search products or SKUs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surfaceHighlight border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white border border-primary hover:bg-primaryHover rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(14,165,233,0.3)]">
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-surfaceHighlight/30 text-textMuted">
                <th className="py-4 px-4 font-medium">Product / SKU</th>
                <th className="py-4 px-4 font-medium text-right">Price</th>
                <th className="py-4 px-4 font-medium text-right text-blue-300">Digital Stock</th>
                <th className="py-4 px-4 font-medium text-right text-purple-300">Physical Stock</th>
                <th className="py-4 px-4 font-medium text-right">Difference</th>
                <th className="py-4 px-4 font-medium text-center">Status</th>
                <th className="py-4 px-4 font-medium text-right">Threshold</th>
                <th className="py-4 px-4 font-medium text-right">Last Updated</th>
                <th className="py-4 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const diff = item.physicalStock - item.digitalStock;
                const status = diff === 0 ? 'HEALTHY' : 'MISMATCH';
                const lowStock = item.physicalStock <= item.threshold;

                return (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{item.product}</div>
                      <div className="text-xs text-textMuted font-mono">{item.sku}</div>
                    </td>
                    <td className="py-3 px-4 text-right text-white">{item.price}</td>
                    <td className="py-3 px-4 text-right font-medium text-blue-100">{item.digitalStock}</td>
                    <td className="py-3 px-4 text-right font-medium text-purple-100">{item.physicalStock}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={cn(
                        "font-mono font-medium",
                        diff === 0 ? "text-textMuted" : diff > 0 ? "text-success" : "text-error"
                      )}>
                        {diff > 0 ? '+' : ''}{diff}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={cn(
                          "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider",
                          status === 'HEALTHY' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning border border-warning/20'
                        )}>
                          {status === 'HEALTHY' ? <CheckCircle2 size={12}/> : <AlertTriangle size={12}/>}
                          {status}
                        </span>
                        {lowStock && (
                          <span className="text-[10px] text-error font-medium uppercase">Low Stock</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-textMuted">{item.threshold}</td>
                    <td className="py-3 px-4 text-right text-textMuted text-xs">{item.lastUpdated}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button className="text-xs text-primary hover:text-primaryHover font-medium px-2 py-1 bg-primary/10 rounded">Edit</button>
                      <button className="text-xs text-success hover:text-emerald-400 font-medium px-2 py-1 bg-success/10 rounded">Restock</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
