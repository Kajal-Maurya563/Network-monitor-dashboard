const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Replace 'network_monitor' with your preferred database name
    const conn = await mongoose.connect("mongodb://127.0.0.1:27017/network_monitor", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;