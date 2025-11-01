const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const monitorRoutes = require("./routes/monitorRoutes");
const MonitoredSite = require("./models/MonitoredSite");
const NetworkStat = require("./models/NetworkStat");
const ping = require("ping");

const app = express();
app.use(cors());
app.use(express.json());
connectDB();

let currentActiveUrl = null;

// Auto-monitor only the currently active URL every 10 seconds
setInterval(async () => {
  if (!currentActiveUrl) return;

  try {
    const pingResult = await ping.promise.probe(currentActiveUrl);
    const data = {
      url: currentActiveUrl,
      ping: parseFloat(pingResult.time),
      download: (50 + Math.random() * 50).toFixed(2),
      upload: (10 + Math.random() * 20).toFixed(2),
      packetLoss: Math.random().toFixed(2),
    };
    const stat = new NetworkStat(data);
    await stat.save();
    console.log(`📡 Data stored for ${currentActiveUrl}`);
  } catch (e) {
    console.error(`❌ Failed to monitor ${currentActiveUrl}`);
  }
}, 10000);

// Route for activating a specific site
app.post("/api/set-active", (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });
  currentActiveUrl = url;
  console.log(`✅ Now monitoring: ${url}`);
  res.json({ message: `Now monitoring: ${url}` });
});

// ✅ New route — stop monitoring the current site
app.post("/api/stop-monitoring", (req, res) => {
  currentActiveUrl = null;
  console.log("🛑 Monitoring stopped.");
  res.json({ message: "Monitoring stopped." });
});

app.use("/api", monitorRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Backend running at http://localhost:${PORT}`));



// Speed test proxy route
app.get("/api/speed-test", async (req, res) => {
  try {
    const fileUrl = "https://speed.cloudflare.com/__down?bytes=2500000";
    const start = Date.now();
    const response = await fetch(fileUrl);
    const buffer = await response.arrayBuffer();
    const end = Date.now();

    const duration = (end - start) / 1000;
    const bitsLoaded = buffer.byteLength * 8;
    const mbps = bitsLoaded / duration / 1024 / 1024;

    res.json({ speed: mbps.toFixed(2) });
  } catch (err) {
    console.error("Speed test proxy error:", err.message);
    res.status(500).json({ error: "Speed test failed" });
  }
});

