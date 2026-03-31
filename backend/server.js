import { sendEmail } from "./services/emailService.js";
import User from "./models/User.js";
import express from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import xss from "xss-clean";
import hpp from "hpp";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { createClient } from "redis";
import Groq from "groq-sdk";

import connectDB from "./config/db.js";
import Conversation from "./models/Conversation.js";
import { safeConversationId, pushUnique } from "./patch_core.js";
import crypto from "crypto";
import summarizeRouter from "./routes/summarize.js";
import emailRouter from "./routes/email.js";

dotenv.config();

await connectDB();

// ================= PATH =================
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

// ================= AUTH MIDDLEWARE =================
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
await redis.connect();

// ================= LOG =================
const log = (t, m) =>
  console.log(`[${new Date().toISOString()}][${t}] ${m}`);

// ================= SERVER =================
const server = http.createServer(app);

// ================= SOCKET =================
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

    if (!token) {
      return next(new Error("unauthorized"));
    }

    const user = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = user;

    return next();
  } catch {
    return next(new Error("unauthorized"));
  }
});

// ================= AUTH ROUTES =================
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "missing fields" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: "user exists" });

    const user = await User.create({ name, email, password });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user: { id: user._id, name, email } });
  } catch {
    res.status(500).json({ error: "register failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "invalid credentials" });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user: { id: user._id, name: user.name, email } });
  } catch {
    res.status(500).json({ error: "login failed" });
  }
});



// ================= GROQ =================
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ================= SOCKET CHAT =================
io.on("connection", (socket) => {
  log("INFO", `Connected ${socket.user.id}`);

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

      pushUnique(convo.messages, {
        role: "user",
        content: msg
      });

      const recent = convo.messages
        .slice(-12)
        .map(m => ({ role: m.role, content: m.content }));

      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: recent,
        temperature: 0.6,
        max_tokens: 700,
        stream: true
      });

      let full = "";

      for await (const chunk of completion) {
        const token = chunk.choices?.[0]?.delta?.content || "";
        if (!token) continue;

        full += token;

        socket.emit("message-stream", { token });
      }

      socket.emit("message-stream-done");

      pushUnique(convo.messages, {
        role: "assistant",
        content: full
      });

      convo.messages = convo.messages.slice(-50);

      await convo.save();

    } catch (e) {
      console.error(e);
      socket.emit("message-error", { msg: "FAIL" });
    }
  });

  socket.on("disconnect", () => {
    log("INFO", `Disconnected ${socket.user.id}`);
  });
});

// ================= PROTECTED API =================
app.get("/api/conversations", requireAuth, async (req, res) => {
  try {
    const chats = await Conversation.find({ userId: req.user.id })
      .select("conversationId title updatedAt")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch {
    res.json([]);
  }
});

app.get("/api/conversation/:id", requireAuth, async (req, res) => {
  try {
    const convo = await Conversation.findOne({
      userId: req.user.id,
      conversationId: req.params.id
    });

    res.json(convo || { messages: [] });
  } catch {
    res.json({ messages: [] });
  }
});


app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExp: { $gt: Date.now() }
    });

    if (!user)
      return res.status(400).json({ error: "invalid or expired token" });

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExp = undefined;

    await user.save();

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "reset failed" });
  }
});

app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "missing email" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "user not found" });

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExp = Date.now() + 1000 * 60 * 30;
    await user.save();

    sendEmail({
      to: email,
      subject: "Reset Password",
      htmlContent: `<a href="https://siraj.software/reset-password/${token}">Reset Password</a>`
    }).catch(console.error);

    res.json({ ok: true });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed" });
  }
});


// ================= HEALTH =================
app.get("/api/health", (req, res) => {
  res.json({
    mongo: mongoose.connection.readyState === 1,
    redis: redis.isOpen
  });
});

// ================= START =================
server.listen(process.env.PORT || 5000, () => {
  log("INFO", "SIRAJ MULTICHAT ONLINE");
});

