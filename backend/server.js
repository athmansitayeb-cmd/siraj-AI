import 'dotenv/config';
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import { orchestrate } from "./core/orchestrator.js";
import authRouter from "./routes/auth.js";
import conversationRouter from "./routes/conversation.js";
import { updateUserMemory } from "./core/userMemory.js";
import { runtimeGate } from "./core/runtime.js";
import { buildSystemPrompt } from "./core/brain.js";
import { sendEmail } from "./services/emailService.js";
import User from "./models/User.js";
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import xss from "xss-clean";
import hpp from "hpp";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { createClient } from "redis";
import Conversation from "./models/Conversation.js";
import { safeConversationId, pushUnique } from "./patch_core.js";
import crypto from "crypto";
import summarizeRouter from "./routes/summarize.js";
import emailRouter from "./routes/email.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================= APP =================
const app = express();
app.set("trust proxy", 1);

app.use(helmet());
app.use(xss());
app.use(hpp());
app.use(mongoSanitize());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/conversation", conversationRouter);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "siraj-backend",
    mongo: mongoose.connection.readyState === 1,
    redis: redis?.isOpen || false,
    uptime: process.uptime()
  });
});

app.use(cors({
  origin: "https://siraj.software",
  credentials: true
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120
}));

app.use("/api/summarize", summarizeRouter);
app.use("/api/email", emailRouter);

// ================= AUTH =================
const requireAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "unauthorized" });

    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "invalid token" });
  }
};

// ================= REDIS =================
const redis = createClient({ url: process.env.REDIS_URL });
redis.on("error", () => console.log("Redis fallback mode"));

// ================= SERVER =================
const server = http.createServer(app);

const io = new Server(server, {
  path: "/socket.io",
  cors: {
    origin: "https://siraj.software",
    credentials: true
  }
});

// ================= SOCKET AUTH =================
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("unauthorized"));

    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new Error("unauthorized"));
  }
});

// ================= GROQ =================

// ================= SOCKET CHAT =================
io.on("connection", (socket) => {
  console.log(`[SOCKET] connected: ${socket.user.id}`);

  socket.on("message", async ({ conversationId, msg }) => {
    try {
      const cid = safeConversationId(conversationId);
      if (!cid || !msg) return;

      let convo = await Conversation.findOne({
        userId: socket.user.id,
        conversationId: cid
      });

      if (!convo) {
        convo = await Conversation.create({
          userId: socket.user.id,
          conversationId: cid,
          messages: []
        });
      }

      pushUnique(convo.messages, { role: "user", content: msg });

      await updateUserMemory(socket.user.id, msg);

const orchestrateResult = await orchestrate({
  convo: convo.messages,
  msg,
  userId: socket.user.id
});

if (!orchestrateResult.ok) {
  socket.emit("message-error", {
    msg: "AI_BLOCKED",
    reason: orchestrateResult.reason
  });
  return;
}

const full = orchestrateResult.text;

socket.emit("message-stream", { token: full });
socket.emit("message-stream-done");

      // ================= RUNTIME CHECK =================
      const gateResult = runtimeGate(full);

      if (!gateResult.ok) {
        socket.emit("message-error", {
          msg: gateResult.action === "reject"
            ? "REJECTED_RESPONSE"
            : "REGENERATE_REQUESTED",
          reason: gateResult.reason,
          score: gateResult.score
        });
        return;
      }

      convo.messages.push({
        role: "assistant",
        content: full
      });

      convo.messages = convo.messages.slice(-50);
      await convo.save();

      socket.emit("message", full);

    } catch (e) {
      console.error(e);
      socket.emit("message-error", { msg: "FAIL" });
    }
  });

  socket.on("disconnect", () => {
    console.log(`[SOCKET] disconnected: ${socket.user.id}`);
  });
});


const start = async () => {
  try {
    await connectDB();

    await redis.connect();

    server.listen(process.env.PORT || 5000, () => {
      console.log("SIRAJ MULTICHAT ONLINE");
    });

  } catch (err) {
    console.error("BOOT ERROR:", err);
    process.exit(1);
  }
};

start();
