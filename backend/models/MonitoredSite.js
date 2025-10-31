const mongoose = require("mongoose");

const monitoredSiteSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  addedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MonitoredSite", monitoredSiteSchema);

