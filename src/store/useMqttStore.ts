import { create } from 'zustand';

export type MqttStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

export interface TelemetryData {
  time: string;
  battery?: number;
  temperature?: number;
  cpu?: number;
  fps?: number;
  signal?: number;
  voltage?: number;
  ram?: number;
  gps?: string;
  camera?: string;
  nav?: string;
}

interface MqttState {
  wsClient: WebSocket | null;
  status: MqttStatus;
  telemetry: TelemetryData | null;
  logs: any[];
  setWsClient: (client: WebSocket | null) => void;
  setStatus: (status: MqttStatus) => void;
  updateTelemetry: (data: Partial<TelemetryData>) => void;
  addLog: (log: any) => void;
  disconnect: () => void;
}

export const useMqttStore = create<MqttState>((set, get) => ({
  wsClient: null,
  status: 'DISCONNECTED',
  telemetry: null,
  logs: [],
  setWsClient: (client) => set({ wsClient: client }),
  setStatus: (status) => set({ status }),
  updateTelemetry: (data) => set((state) => ({ 
    telemetry: { 
      ...(state.telemetry || { time: new Date().toLocaleTimeString() }), 
      ...data,
      time: new Date().toLocaleTimeString() // Always update time on new data
    } 
  })),
  addLog: (log) => set((state) => ({ logs: [log, ...state.logs].slice(0, 100) })), // Keep last 100
  disconnect: () => {
    const { wsClient } = get();
    if (wsClient) {
      wsClient.close();
      set({ wsClient: null, status: 'DISCONNECTED' });
    }
  }
}));
