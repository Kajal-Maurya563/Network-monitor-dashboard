const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./db");
const monitorRoutes = require("./routes/monitorRoutes");
const NetworkStat = require("./models/NetworkStat");
const ping = require("ping");

// Connect to MongoDB
connectDB();

const app = express();
app.use(cors());

// Middleware for different route needs
app.use(express.raw({ type: 'application/octet-stream', limit: '100mb' })); // For Upload Test
app.use(express.json()); // For other API routes

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let currentActiveUrl = null; // For the Network Monitor

// --- Feature 1: Network Monitor Loop (Your Original Code) ---
const getMonitorDownloadSpeed = async () => {
  try {
    const fileUrl = "https://speed.cloudflare.com/__down?bytes=2500000"; // 2.5MB
    const start = Date.now();
    const response = await fetch(fileUrl);
    await response.arrayBuffer();
    const end = Date.now();
    const duration = (end - start) / 1000;
    const bitsLoaded = 2500000 * 8;
    const mbps = (bitsLoaded / duration / 1024 / 1024).toFixed(2);
    return parseFloat(mbps);
  } catch (err) {
    console.error("Monitor speed test failed:", err.message);
    return 0;
  }
};

setInterval(async () => {
  if (!currentActiveUrl) return;

  try {
    const pingResult = await ping.promise.probe(currentActiveUrl);
    const downloadSpeed = await getMonitorDownloadSpeed();

    const data = {
      url: currentActiveUrl,
      ping: parseFloat(pingResult.time) || 0,
      download: downloadSpeed,
      upload: 0, // We are not testing upload for the monitor
      packetLoss: parseFloat(pingResult.packetLoss) || 0,
      timestamp: new Date(),
    };

    const stat = new NetworkStat(data);
    await stat.save();
    
    // Push the new stat to all clients watching the monitor
    io.emit("new-monitor-stat", stat);
    
    console.log(`📡 Data stored for ${currentActiveUrl}`);
  } catch (e) {
    console.error(`❌ Failed to monitor ${currentActiveUrl}`, e);
  }
}, 60000); // Run every 60 seconds

// --- Feature 2: Speed Test WebSocket (For User's PC) ---
io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Listener for the *Full Speed Test* (Ping/Jitter)
  socket.on("client-ping", (startTime) => {
    socket.emit("server-pong", startTime);
  });
  
  // --- NEW: Listener for the *Live Ping Monitor* ---
  socket.on("client-live-ping", (startTime) => {
    socket.emit("server-live-pong", startTime);
  });
  
  // Listener for the Network Monitor page
  socket.on("set-active-url", (url) => {
    currentActiveUrl = url;
    console.log(`✅ Now monitoring: ${url}`);
    socket.emit("monitoring-started", url);
  });
  
  socket.on("stop-monitoring", () => {
    currentActiveUrl = null;
    console.log("🛑 Monitoring stopped.");
    socket.emit("monitoring-stopped");
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// All API routes
app.use("/api", monitorRoutes);

const PORT = 5000;
server.listen(PORT, () =>
  console.log(`✅ Backend running at http://localhost:${PORT}`)
);