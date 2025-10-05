const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/skillswap";
    console.log("🔗 Connecting to MongoDB...");
    console.log("📍 URI:", mongoURI.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local MongoDB');
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.log("⚠️  Server will continue without database connection");
    // Don't exit process for development
  }
};

module.exports = connectDB;
