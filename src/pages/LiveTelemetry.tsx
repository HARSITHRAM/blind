import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Activity, 
  Battery, 
  Cpu, 
  Thermometer, 
  Wifi, 
  Eye, 
  Navigation2,
  Zap,
  HardDrive
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAppStore } from '../store/useAppStore';
import { useMqttStore } from '../store/useMqttStore';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

// Generate initial mock timeseries
const generateTimeseries = (base: number, variance: number, count: number) => {
  const now = new Date();
  return Array.from({ length: count }).map((_, i) => ({
    time: format(new Date(now.getTime() - (count - i) * 1000), 'HH:mm:ss'),
    value: Math.max(0, base + (Math.random() * variance * 2 - variance))
  }));
};

export function LiveTelemetry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDemoMode } = useAppStore();
  const { telemetry, status } = useMqttStore();

  const [data, setData] = useState({
    battery: generateTimeseries(85, 0.5, 30),
    temperature: generateTimeseries(42, 2, 30),
    cpu: generateTimeseries(45, 10, 30),
    fps: generateTimeseries(24, 2, 30),
    signal: generateTimeseries(-58, 3, 30),
  });

  const [current, setCurrent] = useState({
    battery: 85,
    voltage: 4.1,
    temp: 42,
    cpu: 45,
    ram: 32,
    gps: 'FIX (1.2m)',
    signal: -58,
    mqtt: 'CONNECTED',
    camera: 'ACTIVE',
    fps: 24,
    nav: 'NAVIGATING'
  });

  // Simulate real-time updates
  useEffect(() => {
    if (!isDemoMode) return;

    const interval = setInterval(() => {
      const now = format(new Date(), 'HH:mm:ss');
      
      setCurrent(prev => {
        const newBattery = Math.max(0, prev.battery - (Math.random() > 0.8 ? 1 : 0));
        const newTemp = prev.temp + (Math.random() * 2 - 1);
        const newCpu = Math.max(10, Math.min(95, prev.cpu + (Math.random() * 10 - 5)));
        const newFps = Math.max(15, Math.min(30, prev.fps + (Math.random() * 4 - 2)));
        const newSignal = Math.min(-30, Math.max(-90, prev.signal + (Math.random() * 4 - 2)));

        setData(d => ({
          battery: [...d.battery.slice(1), { time: now, value: newBattery }],
          temperature: [...d.temperature.slice(1), { time: now, value: newTemp }],
          cpu: [...d.cpu.slice(1), { time: now, value: newCpu }],
          fps: [...d.fps.slice(1), { time: now, value: newFps }],
          signal: [...d.signal.slice(1), { time: now, value: newSignal }],
        }));

        return {
          ...prev,
          battery: newBattery,
          temp: newTemp,
          cpu: newCpu,
          fps: newFps,
          signal: newSignal,
          voltage: 3.3 + (newBattery / 100) * 0.9 // rough simulation
        };
      });

    }, 1000);

    return () => clearInterval(interval);
  }, [isDemoMode]);

  // Live real-time updates from MQTT
  useEffect(() => {
    if (isDemoMode || !telemetry) return;

    const now = telemetry.time || format(new Date(), 'HH:mm:ss');
    
    setCurrent(prev => ({
      ...prev,
      battery: telemetry.battery ?? prev.battery,
      voltage: telemetry.voltage ?? prev.voltage,
      temp: telemetry.temperature ?? prev.temp,
      cpu: telemetry.cpu ?? prev.cpu,
      ram: telemetry.ram ?? prev.ram,
      fps: telemetry.fps ?? prev.fps,
      signal: telemetry.signal ?? prev.signal,
      mqtt: status,
      gps: telemetry.gps ?? prev.gps,
      camera: telemetry.camera ?? prev.camera,
      nav: telemetry.nav ?? prev.nav,
    }));

    setData(d => ({
      battery: telemetry.battery !== undefined ? [...d.battery.slice(1), { time: now, value: telemetry.battery }] : d.battery,
      temperature: telemetry.temperature !== undefined ? [...d.temperature.slice(1), { time: now, value: telemetry.temperature }] : d.temperature,
      cpu: telemetry.cpu !== undefined ? [...d.cpu.slice(1), { time: now, value: telemetry.cpu }] : d.cpu,
      fps: telemetry.fps !== undefined ? [...d.fps.slice(1), { time: now, value: telemetry.fps }] : d.fps,
      signal: telemetry.signal !== undefined ? [...d.signal.slice(1), { time: now, value: telemetry.signal }] : d.signal,
    }));
  }, [telemetry, isDemoMode, status]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/sticks/${id}`)}
            className="p-2 bg-surfaceHighlight border border-white/10 rounded-lg text-textMuted hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              Live Telemetry: {id}
              {isDemoMode && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-warning/20 text-warning border border-warning/50 animate-pulse">
                  DEMO DATA
                </span>
              )}
            </h1>
            <p className="text-textMuted mt-1">Real-time edge sensor data</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surfaceHighlight rounded-lg border border-white/5">
            <span className="w-2 h-2 rounded-full bg-success animate-ping"></span>
            <span className="text-success font-medium">Stream Active</span>
          </div>
        </div>
      </div>

      {/* Live Readouts Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <MetricCard label="Battery" value={`${current.battery.toFixed(0)}%`} icon={Battery} />
        <MetricCard label="Voltage" value={`${current.voltage.toFixed(2)}V`} icon={Zap} />
        <MetricCard label="CPU Temp" value={`${current.temp.toFixed(1)}°C`} icon={Thermometer} alert={current.temp > 60} />
        <MetricCard label="CPU Usage" value={`${current.cpu.toFixed(0)}%`} icon={Cpu} alert={current.cpu > 85} />
        <MetricCard label="RAM Usage" value={`${current.ram}%`} icon={HardDrive} />
        <MetricCard label="GPS" value={current.gps} icon={Navigation2} />
        <MetricCard label="Signal" value={`${current.signal.toFixed(0)} dBm`} icon={Wifi} />
        <MetricCard label="MQTT" value={current.mqtt} icon={Activity} />
        <MetricCard label="Camera" value={current.camera} icon={Eye} />
        <MetricCard label="YOLO FPS" value={`${current.fps.toFixed(1)}`} icon={Eye} />
        <MetricCard label="Navigation" value={current.nav} icon={Navigation2} className="col-span-2" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Battery Drain (%)" data={data.battery} color="#10b981" />
        <ChartCard title="CPU Temperature (°C)" data={data.temperature} color="#ef4444" />
        <ChartCard title="CPU Usage (%)" data={data.cpu} color="#f59e0b" />
        <ChartCard title="YOLO Inference (FPS)" data={data.fps} color="#0ea5e9" />
        <ChartCard title="Network Signal (dBm)" data={data.signal} color="#8b5cf6" className="lg:col-span-2" />
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, alert, className }: any) {
  return (
    <div className={cn("glass-card p-4", className, alert && "border-error/50 bg-error/10")}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-textMuted tracking-wider truncate">{label}</span>
        <Icon size={16} className={alert ? "text-error" : "text-textMuted"} />
      </div>
      <div className={cn("text-xl font-bold truncate", alert ? "text-error" : "text-white")}>{value}</div>
    </div>
  );
}

function ChartCard({ title, data, color, className }: any) {
  return (
    <div className={cn("glass-panel p-5", className)}>
      <h2 className="text-sm font-semibold text-white mb-4">{title}</h2>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} minTickGap={30} />
            <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', borderRadius: '8px' }}
              itemStyle={{ color: '#f9fafb' }}
              labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
              animationDuration={150}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2} 
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
