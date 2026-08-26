import { useEffect, useRef } from 'react';
import mqtt from 'mqtt';
import { useMqttStore } from '../../store/useMqttStore';
import { useAppStore } from '../../store/useAppStore';

const MQTT_URL = 'wss://broker.hivemq.com:8443/mqtt';

export function MqttProvider({ children }: { children: React.ReactNode }) {
  const { setMqttClient, setStatus, updateTelemetry, addLog, status, disconnect } = useMqttStore();
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

    if (initialized.current) return;
    initialized.current = true;

    setStatus('CONNECTING');
    
    console.log('Attempting to connect to HiveMQ via secure WebSocket...');
    const client = mqtt.connect(MQTT_URL, {
      clientId: `mivo-web-${Math.random().toString(16).substring(2, 10)}`,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 5000,
    });

    client.on('connect', () => {
      console.log('Connected to HiveMQ WebSocket');
      setStatus('CONNECTED');
      setMqttClient(client);

      // Subscribe to topics
      client.subscribe('smartblindstick/telemetry');
      client.subscribe('smartblindstick/alerts');
    });

    client.on('error', (err) => {
      console.error('MQTT Connection Error:', err);
      setStatus('ERROR');
    });

    client.on('offline', () => {
      console.log('MQTT Client Offline');
      setStatus('DISCONNECTED');
    });

    client.on('message', (topic, message) => {
      try {
        const payload = JSON.parse(message.toString());
        
        if (topic.endsWith('/telemetry')) {
          updateTelemetry(payload);
        } else if (topic.endsWith('/alerts') || topic.endsWith('/emergency')) {
          addLog({
            id: `ev-${Date.now()}`,
            device: payload.device_id || 'UNKNOWN',
            timestamp: new Date().toLocaleTimeString(),
            type: payload.type || (topic.endsWith('/emergency') ? 'Emergency' : 'System'),
            severity: payload.severity || (topic.endsWith('/emergency') ? 'CRITICAL' : 'INFO'),
            message: payload.message || JSON.stringify(payload),
          });
        }
      } catch (e) {
        console.warn('Failed to parse MQTT message as JSON:', message.toString());
      }
    });

    return () => {
      console.log('Disconnecting MQTT...');
      client.end();
      setStatus('DISCONNECTED');
      initialized.current = false;
    };
  }, [isDemoMode, setMqttClient, setStatus, updateTelemetry, addLog, disconnect, status]);

  return <>{children}</>;
}
