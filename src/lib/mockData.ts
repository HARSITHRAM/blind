export const mockAnalytics = {
  dailyRevenue: 15400,
  activeDevices: 4,
  sosAlerts: 1
};

export const mockDevices = [
  {
    id: "SBS-0001",
    type: "Smart Stick",
    status: "ONLINE",
    owner: "Harsithram",
    battery: 85,
    temperature: 42,
    location: "11.272100, 77.605500",
    lastSeen: "Just now",
    network: "4G (Airtel)",
    firmware: "v3.2.0"
  },
  {
    id: "SBS-0002",
    type: "Smart Stick",
    status: "OFFLINE",
    owner: "John Doe",
    battery: 12,
    temperature: 30,
    location: "11.270000, 77.602000",
    lastSeen: "2 hours ago",
    network: "4G (Jio)",
    firmware: "v3.1.5"
  },
  {
    id: "SHOP-UNIT-1",
    type: "Shop Unit",
    status: "ONLINE",
    owner: "Mivo Store",
    battery: 100,
    temperature: 35,
    location: "11.271917, 77.605333",
    lastSeen: "Just now",
    network: "WiFi",
    firmware: "v2.0.1"
  },
  {
    id: "SBS-0003",
    type: "Smart Stick",
    status: "ONLINE",
    owner: "Jane Smith",
    battery: 67,
    temperature: 38,
    location: "11.275000, 77.608000",
    lastSeen: "Just now",
    network: "4G (Vi)",
    firmware: "v3.2.0"
  }
];

export const mockLogs = [
  {
    id: "log-1",
    device: "SBS-0001",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toLocaleTimeString(),
    type: "SOS",
    severity: "CRITICAL",
    message: "SOS button pressed by user."
  },
  {
    id: "log-2",
    device: "SBS-0002",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toLocaleTimeString(),
    type: "System",
    severity: "WARNING",
    message: "Device went offline. Last known battery: 12%"
  },
  {
    id: "log-3",
    device: "SHOP-UNIT-1",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toLocaleTimeString(),
    type: "Transaction",
    severity: "INFO",
    message: "Payment received successfully for item ID 45."
  },
  {
    id: "log-4",
    device: "SBS-0003",
    timestamp: new Date(Date.now() - 1000 * 60 * 200).toLocaleTimeString(),
    type: "System",
    severity: "INFO",
    message: "Firmware updated successfully to v3.2.0"
  }
];

export const mockTransactions = [
  {
    id: "TXN-9821",
    vendor: "Mivo Store",
    device: "SHOP-UNIT-1",
    time: new Date(Date.now() - 1000 * 60 * 30).toLocaleTimeString(),
    amount: "₹450",
    status: "Completed",
    items: ["Groceries"]
  },
  {
    id: "TXN-9820",
    vendor: "Mivo Store",
    device: "SHOP-UNIT-1",
    time: new Date(Date.now() - 1000 * 60 * 150).toLocaleTimeString(),
    amount: "₹120",
    status: "Completed",
    items: ["Snacks"]
  },
  {
    id: "TXN-9819",
    vendor: "Mivo Store",
    device: "SHOP-UNIT-1",
    time: new Date(Date.now() - 1000 * 60 * 300).toLocaleTimeString(),
    amount: "₹850",
    status: "Failed",
    items: ["Electronics"]
  }
];

export const mockUsers = [
  {
    id: "USER-1",
    name: "System Admin",
    email: "admin@mivo.com",
    role: "System Admin",
    status: "Active",
    lastActive: "Just now",
    devices: 4
  },
  {
    id: "USER-2",
    name: "Vendor 1",
    email: "vendor1@mivo.com",
    role: "Vendor",
    status: "Active",
    lastActive: "1 hour ago",
    devices: 1
  }
];
