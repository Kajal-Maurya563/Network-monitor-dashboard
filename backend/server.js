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

app.use("/api", monitorRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Backend running at http://localhost:${PORT}`));
