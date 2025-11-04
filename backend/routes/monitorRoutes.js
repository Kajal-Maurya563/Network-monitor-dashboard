const express = require("express");
const dns = require("dns").promises;
const whois = require("whois");
const MonitoredSite = require("../models/MonitoredSite");
const NetworkStat = require("../models/NetworkStat");

const router = express.Router();

// --- Routes for Network Monitor (Your Original Code) ---

// Add a new URL to history
router.post("/add-url", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });
  try {
    const existing = await MonitoredSite.findOne({ url });
    if (!existing) {
      const site = new MonitoredSite({ url });
      await site.save();
    }
    res.json({ message: `✅ ${url} ready for monitoring` });
  } catch (err) {
    res.status(500).json({ error: "Failed to add URL" });
  }
});

// Fetch all stored URLs for the dropdown
router.get("/all-urls", async (req, res) => {
  try {
    const sites = await MonitoredSite.find().sort({ addedAt: -1 });
    res.json(sites.map((s) => s.url));
  } catch {
    res.status(500).json({ error: "Failed to fetch URLs" });
  }
});

// Fetch latest history (last 20 points) for a URL
router.get("/history/:url", async (req, res) => {
  const { url } = req.params;
  try {
    const data = await NetworkStat.find({ url })
      .sort({ timestamp: -1 })
      .limit(20);
    res.json(data.reverse()); // Send in chronological order
  } catch {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});


// --- Routes for Tools ---

// DNS Lookup
router.post("/dns-lookup", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });
  try {
    const [a, aaaa, cname, mx] = await Promise.allSettled([
      dns.resolve(url, "A"),
      dns.resolve(url, "AAAA"),
      dns.resolve(url, "CNAME"),
      dns.resolve(url, "MX"),
    ]);
    res.json({
      a: a.status === "fulfilled" ? a.value : [],
      aaaa: aaaa.status === "fulfilled" ? aaaa.value : [],
      cname: cname.status === "fulfilled" ? cname.value : [],
      mx: mx.status === "fulfilled" ? mx.value : [],
    });
  } catch (err) {
    res.status(500).json({ error: "DNS lookup failed" });
  }
});

// Whois Lookup
const whoisPromise = (url) => {
  return new Promise((resolve, reject) => {
    whois.lookup(url, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
};
router.post("/whois", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });
  try {
    const data = await whoisPromise(url);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Whois lookup failed" });
  }
});

// Upload Test
router.post("/upload-test", (req, res) => {
  // This route is used by the client-side speed test.
  // It just accepts the data and ends.
  res.status(200).send({ message: "Upload received" });
});

module.exports = router;