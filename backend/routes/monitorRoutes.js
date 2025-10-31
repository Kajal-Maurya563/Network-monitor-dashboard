const express = require("express");
const ping = require("ping");
const NetworkStat = require("../models/NetworkStat");
const MonitoredSite = require("../models/MonitoredSite");

const router = express.Router();

// --- Add a new URL to monitor ---
router.post("/add-url", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    const site = new MonitoredSite({ url });
    await site.save();
    res.json({ message: `✅ ${url} added for monitoring` });
  } catch (err) {
    res.status(500).json({ error: "Failed to add URL (maybe already exists)" });
  }
});

// --- Get metrics for a specific URL ---
router.get("/metrics/:url", async (req, res) => {
  const { url } = req.params;
  try {
    const pingResult = await ping.promise.probe(url);
    const data = {
      url,
      ping: parseFloat(pingResult.time),
      download: (50 + Math.random() * 50).toFixed(2),
      upload: (10 + Math.random() * 20).toFixed(2),
      packetLoss: Math.random().toFixed(2),
    };

    const stat = new NetworkStat(data);
    await stat.save();

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: `Failed to collect data for ${url}` });
  }
});

// --- View recent history ---
router.get("/history", async (req, res) => {
  const data = await NetworkStat.find().sort({ timestamp: -1 }).limit(20);
  res.json(data);
});

module.exports = router;



// const express = require("express");
// const ping = require("ping");
// const NetworkStat = require("../models/NetworkStat");
// const MonitoredSite = require("../models/MonitoredSite");

// const router = express.Router();

// // --- Old route ---
// // Get metrics for a default host (for backward compatibility)
// router.get("/metrics:url", async (req, res) => {
//   const host = "youtube.com"; // default target
//   try {
//     const pingResult = await ping.promise.probe(host);
//     const data = {
//       url: host,
//       ping: parseFloat(pingResult.time),
//       download: (50 + Math.random() * 50).toFixed(2),
//       upload: (10 + Math.random() * 20).toFixed(2),
//       packetLoss: Math.random().toFixed(2),
//     };

//     const stat = new NetworkStat(data);
//     await stat.save();

//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ error: "Metric collection failed" });
//   }
// });

// // --- New Route ---
// // Add a new URL to monitor
// router.post("/add-url", async (req, res) => {
//   const { url } = req.body;
//   if (!url) return res.status(400).json({ error: "URL is required" });

//   try {
//     const site = new MonitoredSite({ url });
//     await site.save();
//     res.json({ message: `✅ ${url} added for monitoring` });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to add URL (maybe already exists)" });
//   }
// });

// // --- New Route ---
// // Monitor a specific URL provided by the user
// router.get("/metrics/:url", async (req, res) => {
//   const { url } = req.params;
//   try {
//     const pingResult = await ping.promise.probe(url);
//     const data = {
//       url,
//       ping: parseFloat(pingResult.time),
//       download: (50 + Math.random() * 50).toFixed(2),
//       upload: (10 + Math.random() * 20).toFixed(2),
//       packetLoss: Math.random().toFixed(2),
//     };

//     const stat = new NetworkStat(data);
//     await stat.save();

//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ error: `Failed to collect data for ${url}` });
//   }
// });

// // --- Existing route ---
// // View latest history
// router.get("/history", async (req, res) => {
//   const data = await NetworkStat.find().sort({ timestamp: -1 }).limit(20);
//   res.json(data);
// });

// module.exports = router;


// // const express = require("express");
// // const ping = require("ping");
// // const NetworkStat = require("../models/NetworkStat");

// // const router = express.Router();

// // router.get("/metrics", async (req, res) => {
// // //   const host = "google.com";
// //   const host = "youtube.com";
// //   try {
// //     const pingResult = await ping.promise.probe(host);
// //     const data = {
// //       ping: parseFloat(pingResult.time),
// //       download: (50 + Math.random() * 50).toFixed(2),
// //       upload: (10 + Math.random() * 20).toFixed(2),
// //       packetLoss: Math.random().toFixed(2),
// //     };

// //     // save to DB
// //     const stat = new NetworkStat(data);
// //     await stat.save();

// //     res.json(data);
// //   } catch (error) {
// //     res.status(500).json({ error: "Metric collection failed" });
// //   }
// // });

// // router.get("/history", async (req, res) => {
// //   const data = await NetworkStat.find().sort({ timestamp: -1 }).limit(20);
// //   res.json(data);
// // });

// // module.exports = router;
