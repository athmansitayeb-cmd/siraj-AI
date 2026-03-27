import mongoose from "mongoose";

let connected = false;

export default async function connectDB() {
  if (connected || mongoose.connection.readyState === 1) return;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    connected = true;
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.log("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
}
