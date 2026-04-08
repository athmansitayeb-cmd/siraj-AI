import dotenv from "dotenv";
dotenv.config();
console.log("ENV CHECK:", process.env.GROQ_API_KEY ? "OK" : "MISSING");
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import { orchestrate } from "./core/orchestrator.js";
import User from "./models/User.js";
import authRouter from "./routes/auth.js";
import conversationRouter from "./routes/conversation.js";
import { runtimeGate } from "./core/runtime.js";
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
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("unauthorized"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return next(new Error("unauthorized"));

    socket.user = {
      id: user._id.toString(),
      plan: user.plan
    };

    next();
  } catch (err) {
    next(new Error("unauthorized"));
  }
});

// ================= SOCKET CHAT =================
io.on("connection", (socket) => {
  console.log(`[SOCKET] connected: ${socket.user.id}`);

  socket.on("message", async ({ conversationId, msg }) => {
    try {
      const cid = safeConversationId(conversationId);
      if (!cid || !msg) return;

console.log("REQ", {
  user: socket.user.id,
  msgLength: msg.length
});

// ================= MESSAGE SIZE LIMIT =================
      if (msg.length > 1000) {
        socket.emit("message-error", {
          msg: "MESSAGE_TOO_LONG"
        });
        return;
      }

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

const lastMsgKey = `last:${socket.user.id}`;
const last = await redis.get(lastMsgKey);

if (last === msg) return;

await redis.setEx(lastMsgKey, 2, msg);

const rateKey = `rl:${socket.user.id}`;
const count = await redis.incr(rateKey);

if (count === 1) await redis.expire(rateKey, 60);

// 20 request / minute max
if (count > 20) {
  socket.emit("message-error", {
    msg: "RATE_LIMIT_AI"
  });
  return;
}

// ================= DAILY LIMIT =================
const dailyKey = `daily:${socket.user.id}`;
const daily = await redis.incr(dailyKey);

if (daily === 1) {
  await redis.expire(dailyKey, 86400); // 24h
}

let limit = 200;

if (socket.user.plan === "pro") {
  limit = 2000;
}

if (daily > limit) {
  socket.emit("message-error", {
    msg: "LIMIT_REACHED",
    plan: socket.user.plan
  });
  return;
}

const orchestrateResult = await orchestrate({
  convo: convo.messages,
  msg,
  userId: socket.user.id,
  redis
});

if (!orchestrateResult.ok) {
  socket.emit("message-error", {
    msg: "AI_BLOCKED",
    reason: orchestrateResult.reason
  });
  return;
}

const full = orchestrateResult.text;

const text = orchestrateResult.text;

// streaming controlled + stable
let buffer = "";

for (const token of text.split(/(\s+)/)) {
  buffer += token;

  socket.emit("message-stream", {
    token
  });
}

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
