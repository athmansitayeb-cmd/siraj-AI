import express from "express";
import dotenv from "dotenv";
import summarizeRouter from "./routes/summarize.js";
import mongoose from "mongoose";
import Redis from "ioredis";

dotenv.config();

const app = express();
app.use(express.json());

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

// Redis
const redis = new Redis(process.env.REDIS_URL);
redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", err => console.error("Redis error:", err));

// Routes
app.use("/api/summarize", summarizeRouter);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`[INFO] Server running on ${PORT}`));
