import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { LineChart as ChartIcon } from 'lucide-react';
import { cn } from '../lib/utils';

const chartData = [
  { name: 'Mon', sales: 4000, transactions: 24 },
  { name: 'Tue', sales: 3000, transactions: 18 },
  { name: 'Wed', sales: 5000, transactions: 30 },
  { name: 'Thu', sales: 2780, transactions: 16 },
  { name: 'Fri', sales: 1890, transactions: 12 },
  { name: 'Sat', sales: 2390, transactions: 15 },
  { name: 'Sun', sales: 3490, transactions: 20 },
];

const errorFreqData = [
  { name: 'GPS Timeout', count: 42 },
  { name: 'Motor Jam', count: 18 },
  { name: 'Camera Drop', count: 35 },
  { name: 'MQTT Disconnect', count: 12 },
];

const productData = [
  { name: 'Water', value: 400 },
  { name: 'Chips', value: 300 },
  { name: 'Biscuits', value: 300 },
  { name: 'Juice', value: 200 },
];

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b'];

export function Analytics() {
  const [timeRange, setTimeRange] = useState('7d');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ChartIcon size={24} className="text-primary" /> Analytics Dashboard
          </h1>
          <p className="text-textMuted mt-1">System performance and business metrics</p>
        </div>
        
        <div className="flex items-center gap-2 bg-surfaceHighlight p-1 rounded-lg border border-white/5">
          {['Today', '7d', '30d', 'Custom'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
                timeRange === range ? "bg-surface text-white shadow" : "text-textMuted hover:text-white"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue Chart */}
        <div className="glass-panel p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Daily Revenue (₹)</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', borderRadius: '8px' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transactions Chart */}
        <div className="glass-panel p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Transactions Volume</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', borderRadius: '8px' }}
                  itemStyle={{ color: '#0ea5e9' }}
                  cursor={{ fill: '#1F2937', opacity: 0.4 }}
                />
                <Bar dataKey="transactions" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Sales Pie */}
        <div className="glass-panel p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Most Sold Products</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {productData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', borderRadius: '8px' }}
                  itemStyle={{ color: '#f9fafb' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Error Frequency Bar */}
        <div className="glass-panel p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Error Frequency by Type</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={errorFreqData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', borderRadius: '8px' }}
                  itemStyle={{ color: '#ef4444' }}
                  cursor={{ fill: '#1F2937', opacity: 0.4 }}
                />
                <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
