const mongoose = require("mongoose");

// Disable Mongoose query buffering so operations never hang when offline
mongoose.set("bufferCommands", false);
mongoose.set("bufferTimeoutMS", 1500);

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.log("ℹ️ MongoDB URI not detected in .env — using local JSON store fallback.");
      return null;
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn("⚠️ MongoDB offline or unreachable:", error.message);
    console.log("ℹ️ PocketPilot running in seamless local storage mode.");
    return null;
  }
};

module.exports = connectDB;