import { useEffect, useRef } from 'react';
import { useMqttStore } from '../../store/useMqttStore';
import { useAppStore } from '../../store/useAppStore';

const WS_URL = 'ws://127.0.0.1:8000/ws/dashboard';

export function MqttProvider({ children }: { children: React.ReactNode }) {
  const { setWsClient, setStatus, updateTelemetry, addLog, status, disconnect } = useMqttStore();
  const { isDemoMode } = useAppStore();
  const initialized = useRef(false);

  useEffect(() => {
    // Only connect if we are NOT in demo mode and not already initialized
    if (isDemoMode) {
      if (status !== 'DISCONNECTED') {
        disconnect();
        initialized.current = false;
      }
      return;
    }

    const connectWebSocket = () => {
      if (initialized.current) return;
      initialized.current = true;

      setStatus('CONNECTING');
      
      console.log('Attempting to connect to FastAPI backend via WebSocket...');
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('Connected to FastAPI WebSocket');
        setStatus('CONNECTED');
        setWsClient(ws);
      };

      ws.onerror = (err) => {
        console.error('WebSocket Connection Error:', err);
        setStatus('ERROR');
      };

      ws.onclose = () => {
        console.log('WebSocket Client Offline');
        setStatus('DISCONNECTED');
        initialized.current = false;
        
        // Attempt reconnect after 5s
        setTimeout(() => {
          if (!useAppStore.getState().isDemoMode && !initialized.current) {
             connectWebSocket();
          }
        }, 5000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const { topic, payload } = data;
          
          if (topic.endsWith('/telemetry')) {
            updateTelemetry(payload);
          } else if (topic.endsWith('/logs') || topic.endsWith('/emergency')) {
            addLog({
              id: `ev-${Date.now()}`,
              device: topic.split('/')[1] || 'UNKNOWN',
              timestamp: new Date().toLocaleTimeString(),
              type: topic.endsWith('/emergency') ? 'Emergency' : 'System',
              severity: topic.endsWith('/emergency') ? 'CRITICAL' : (payload.severity || 'INFO'),
              message: payload.message || JSON.stringify(payload),
            });
          }
        } catch (e) {
          console.warn('Failed to parse WebSocket message as JSON:', event.data);
        }
      };

      return ws;
    };

    let ws = connectWebSocket();

    return () => {
      if (ws) {
        console.log('Disconnecting WebSocket...');
        ws.close();
      }
      setStatus('DISCONNECTED');
      initialized.current = false;
    };
  }, [isDemoMode, setWsClient, setStatus, updateTelemetry, addLog, disconnect, status]);

  return <>{children}</>;
}
