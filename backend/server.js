import dotenv from "dotenv";
dotenv.config();
console.log("MODE:", process.env.PAYPAL_MODE);
console.log("ID:", process.env.PAYPAL_CLIENT_ID?.slice(0,10));
console.log("SECRET:", process.env.PAYPAL_CLIENT_SECRET ? "OK" : "MISSING");
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import { orchestrate } from "./core/orchestrator.js";
import User from "./models/User.js";
import authRouter from "./routes/auth.js";
import conversationRouter from "./routes/conversation.js";
import { runtimeGate } from "./core/runtime.js";
import { getUserPlan } from "./core/entitlements.js";
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
import dashboardRouter from "./routes/dashboard.js";
import paypalWebhook from "./routes/paypal-webhook.js";
import paypalSubscriptionRouter from "./routes/paypal-subscription.js";
import dailyVerse from "./routes/dailyVerse.js";

const redis = createClient({ url: process.env.REDIS_URL });

redis.on("error", () => console.log("Redis fallback mode"));

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================= APP =================
const app = express();
await connectDB();
app.set("trust proxy", 1);

redis.connect().then(() => {
  app.locals.redis = redis;
  console.log("Redis ready");
});

app.use("/api/paypal/webhook", express.raw({ type: "*/*" }));

app.use(helmet());
app.use(xss());
app.use(hpp());
app.use(mongoSanitize());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/auth", authRouter);
app.use("/api/conversation", conversationRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api", dailyVerse);

// 🔥 PayPal routes
app.use("/api/paypal", paypalWebhook);
app.use("/api/paypal/subscription", paypalSubscriptionRouter);
app.get("/api/health", (req, res) => {
res.json({
status: "ok",
service: "siraj-backend",
mongo: mongoose.connection.readyState === 1,
redis: redis?.isOpen || false,
uptime: process.uptime()
});
});
app.use("/api/email", emailRouter);

app.get("/api/billing/health", async (req, res) => {
  res.json({
    mode: process.env.PAYPAL_MODE,
    status: "ok"
  });
});
app.get("/api/me", requireAuth, async (req, res) => {
try {
const userId = req.user.id;

const plan = await getUserPlan(userId, redis);

const usage = Number(await redis.get(`usage:${userId}`) || 0);  

res.json({  
  id: userId,  
  plan,  
  usage  
});

} catch (e) {
res.status(500).json({ error: "failed" });
}
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
  plan: await getUserPlan(user._id.toString(), redis)
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

      if (msg.length > 1000) {
        socket.emit("message-error", { msg: "MESSAGE_TOO_LONG" });
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

      // ================= USER MESSAGE =================
      convo.messages.push({
        role: "user",
        content: msg
      });

      convo.messages = convo.messages.slice(-50);

      const lastMsgKey = `last:${socket.user.id}`;
      const last = await redis.get(lastMsgKey);
      if (last === msg) return;

      await redis.setEx(lastMsgKey, 2, msg);

      const rateKey = `rl:${socket.user.id}`;
      const count = await redis.incr(rateKey);

      if (count === 1) await redis.expire(rateKey, 60);

      if (count > 20) {
        socket.emit("message-error", { msg: "RATE_LIMIT_AI" });
        return;
      }

      const dailyKey = `daily:${socket.user.id}`;
      const daily = await redis.incr(dailyKey);

      if (daily === 1) {
        await redis.expire(dailyKey, 86400);
      }

      const currentPlan = await getUserPlan(socket.user.id, redis);
      const limit = currentPlan === "pro" ? 2000 : 200;

      if (daily > limit) {
        socket.emit("message-error", {
          msg: "LIMIT_REACHED",
          plan: currentPlan
        });
        return;
      }

      // ================= AI =================
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

      const text = orchestrateResult.text;

      // ================= STREAM =================
      let buffer = "";

      for (const token of text.split(/(\s+)/)) {
        buffer += token;

        socket.emit("message-stream", {
          token
        });
      }

      socket.emit("message-stream-end", {
        text: buffer
      });

      // ================= FINAL SAVE (IMPORTANT FIX) =================
      convo.messages.push({
        role: "assistant",
        content: buffer
      });

      convo.messages = convo.messages.slice(-50);

      await Conversation.updateOne(
        { userId: socket.user.id, conversationId: cid },
        { $set: { messages: convo.messages } },
        { upsert: true }
      );

    } catch (err) {
      console.error("[SOCKET ERROR]", err);
    }
  });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("SERVER RUNNING ON PORT", PORT);
});

