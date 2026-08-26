import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

// Fix for default marker icons in Leaflet with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for stick vs shop
const stickIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const shopIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface DeviceLocation {
  id: string;
  type: string;
  name: string;
  lat: number;
  lng: number;
  status: string;
}

export function DeviceMap({ devices, height = "400px" }: { devices: DeviceLocation[], height?: string }) {
  const navigate = useNavigate();
  
  // Default center (Erode, TN) if no devices
  const center: [number, number] = devices.length > 0 && devices[0].lat && devices[0].lng 
    ? [devices[0].lat, devices[0].lng] 
    : [11.271917, 77.605333];

  return (
    <div style={{ height, width: '100%', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {devices.map((device) => {
          if (!device.lat || !device.lng) return null;
          
          const isShop = device.type === 'Shop Unit';
          return (
            <Marker 
              key={device.id} 
              position={[device.lat, device.lng]}
              icon={isShop ? shopIcon : stickIcon}
            >
              <Popup className="custom-popup">
                <div className="p-1">
                  <h3 className="font-bold text-gray-900">{device.id}</h3>
                  <p className="text-sm text-gray-600 mb-2">{device.name}</p>
                  <button 
                    onClick={() => navigate(isShop ? `/shops/${device.id}` : `/sticks/${device.id}`)}
                    className="px-3 py-1 bg-primary text-white rounded text-xs font-medium w-full"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
