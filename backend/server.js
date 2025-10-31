const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const monitorRoutes = require("./routes/monitorRoutes");
const MonitoredSite = require("./models/MonitoredSite");
const NetworkStat = require("./models/NetworkStat");
const ping = require("ping");

const app = express();
app.use(cors());
app.use(express.json()); // ✅ <-- ADD THIS LINE
connectDB();

// Auto monitor every 10 seconds
setInterval(async () => {
  const sites = await MonitoredSite.find();
  for (const site of sites) {
    try {
      const pingResult = await ping.promise.probe(site.url);
      const data = {
        url: site.url,
        ping: parseFloat(pingResult.time),
        download: (50 + Math.random() * 50).toFixed(2),
        upload: (10 + Math.random() * 20).toFixed(2),
        packetLoss: Math.random().toFixed(2),
      };
      const stat = new NetworkStat(data);
      await stat.save();
      console.log(`📡 Data stored for ${site.url}`);
    } catch (e) {
      console.error(`❌ Failed to monitor ${site.url}`);
    }
  }
}, 10000);

app.use("/api", monitorRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Backend running at http://localhost:${PORT}`));
