const express = require("express");
const ping = require("ping");
const NetworkStat = require("../models/NetworkStat");
const MonitoredSite = require("../models/MonitoredSite");

const router = express.Router();

// Add a new URL to history (if not already)
router.post("/add-url", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    const existing = await MonitoredSite.findOne({ url });
    if (existing) {
      return res.json({ message: `URL already exists: ${url}` });
    }

    const site = new MonitoredSite({ url });
    await site.save();
    res.json({ message: `✅ ${url} added for future monitoring` });
  } catch (err) {
    res.status(500).json({ error: "Failed to add URL" });
  }
});

// Fetch all stored URLs (for dropdown)
router.get("/all-urls", async (req, res) => {
  try {
    const sites = await MonitoredSite.find().sort({ addedAt: -1 });
    res.json(sites.map((s) => s.url));
  } catch {
    res.status(500).json({ error: "Failed to fetch URLs" });
  }
});

// Fetch latest history (limit)
router.get("/history/:url", async (req, res) => {
  const { url } = req.params;
  try {
    const data = await NetworkStat.find({ url }).sort({ timestamp: -1 }).limit(20);
    res.json(data.reverse());
  } catch {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

module.exports = router;
