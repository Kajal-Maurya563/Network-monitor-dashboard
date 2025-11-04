const mongoose = require("mongoose");

const networkStatSchema = new mongoose.Schema({
  url: { type: String, required: true },
  ping: Number,
  download: Number,
  upload: Number,
  packetLoss: Number,
  date: { type: String, default: () => new Date().toISOString().split("T")[0] }, // yyyy-mm-dd
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("NetworkStat", networkStatSchema);