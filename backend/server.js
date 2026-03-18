// server.js
import emailRoutes from "./routes/email.js";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import Groq from "groq-sdk";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

// Routes & Middleware
import authRoutes from "./routes/auth.js";
import authMiddleware from "./middleware/auth.js";
import chatRoutes from "./routes/chat.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/email", emailRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.log(err));

// Auth routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
// ---------------------------
// Protected Chat via Socket.io
// ---------------------------
const server = http.createServer(app);
const io = new Server(server, { path: "/chat", cors: { origin: "*" } });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// JWT verification for Socket.io
io.use((socket, next) => {
  socket.user = { id: "guest" };
  next();
});

// Chat events
io.on("connection", socket => {
  console.log("🟢 Connected:", socket.user.id);

  socket.on("message", async msg => {
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: msg }]
      });
      socket.emit("message", { response: completion.choices[0].message.content });
    } catch {
      socket.emit("message", { response: "خطأ في الذكاء الاصطناعي" });
    }
  });
});

// ---------------------------
// Serve frontend
// ---------------------------
const frontendPath = path.join(__dirname, "../frontend-react/dist");
app.use(express.static(frontendPath));
// Serve frontend فقط إذا لم يكن API
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ---------------------------
// Start server
// ---------------------------
server.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on ${process.env.PORT}`);
});
