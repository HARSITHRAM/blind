import { create } from 'zustand';
import type { MqttClient } from 'mqtt';

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
  mqttClient: MqttClient | null;
  status: MqttStatus;
  telemetry: TelemetryData | null;
  logs: any[];
  setMqttClient: (client: MqttClient | null) => void;
  setStatus: (status: MqttStatus) => void;
  updateTelemetry: (data: Partial<TelemetryData>) => void;
  addLog: (log: any) => void;
  disconnect: () => void;
}

export const useMqttStore = create<MqttState>((set, get) => ({
  mqttClient: null,
  status: 'DISCONNECTED',
  telemetry: null,
  logs: [],
  setMqttClient: (client) => set({ mqttClient: client }),
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
    const { mqttClient } = get();
    if (mqttClient) {
      mqttClient.end();
      set({ mqttClient: null, status: 'DISCONNECTED' });
    }
  }
}));
