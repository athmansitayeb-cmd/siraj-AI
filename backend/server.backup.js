// server.js - SIRAJ Production Enhanced Memory Version

import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import xss from "xss-clean";
import hpp from "hpp";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import http from "http";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import { createClient } from "redis";
import mongoose from "mongoose";
import fs from "fs";
import Groq from "groq-sdk";

import authRoutes from "./routes/auth.js";
import summarizeRoute from "./routes/summarize.js";
import Conversation from "./models/Conversation.js";
import connectDB from "./config/db.js";

dotenv.config({ path: "/opt/siraj/backend/.env", override: true });

await connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", 1);

// ================= SECURITY =================
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

app.use(cors({
  origin: "https://siraj.software",
  credentials: true
}));

app.use(express.json());

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/summarize", summarizeRoute);

// ================= HEALTH =================
app.get("/api/healthcheck", async (req, res) => {
  try {
    const mongoStatus = mongoose.connection.readyState === 1 ? "OK" : "DOWN";
    res.json({ server: "OK", mongo: mongoStatus });
  } catch (err) {
    res.status(500).json({ server: "DOWN" });
  }
});

// ================= SERVER =================
const server = http.createServer(app);

// ================= REDIS =================
const pubClient = createClient({ url: process.env.REDIS_URL });
await pubClient.connect();

// ================= SOCKET =================
import { Server } from "socket.io";

const io = new Server(server, {
  cors: {
    origin: "https://siraj.software",
    credentials: true
  },
  transports: ["websocket", "polling"]
});

// ================= LOGGING =================
function log(type, msg) {
  const line = `[${new Date().toISOString()}][${type}] ${msg}\n`;
  fs.appendFileSync("logs/server.log", line);
  console.log(line.trim());
}

// ================= AUTH =================
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Unauthorized"));

  try {
    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

// ================= SOCKET CHAT =================
io.on("connection", (socket) => {
  log("INFO", `Connected: ${socket.user.id}`);

  socket.on("message", async (msg) => {
    if (!msg || typeof msg !== "string") return;

    try {
      // ================= LOAD CONVERSATION =================
      let conversation = await Conversation.findOne({ userId: socket.user.id });

      if (!conversation) {
        conversation = new Conversation({
          userId: socket.user.id,
          messages: [],
          memory: { summary: "" }
        });
      }

      // ================= ADD USER MESSAGE =================
      conversation.messages.push({
        role: "user",
        content: msg
      });

      // ================= SHORT MEMORY =================
      const recentMessages = conversation.messages.slice(-10);

      const systemPrompt = `
أنت سراج، مساعد ذكاء اصطناعي عربي احترافي.
ذاكرة المستخدم:
${conversation.memory?.summary || "لا يوجد"}
استخدم المعلومات عند الحاجة فقط.
كن دقيق ومباشر.
`;

      // ================= CACHE =================
      const cacheKey = `chat:${socket.user.id}:${msg}`;
      const cached = await pubClient.get(cacheKey);

      if (cached) {
        socket.emit("message-stream", { delta: cached });
        socket.emit("message-stream-done");
        return;
      }

      // ================= GROQ =================
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

      let fullText = "";
      let attempts = 0;

      while (attempts < 3 && !fullText) {
        try {
          const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemPrompt },
              ...recentMessages
            ],
            temperature: 0.7,
            max_tokens: 800
          });

          fullText = completion.choices?.[0]?.message?.content || "";
        } catch (err) {
          attempts++;
          await new Promise(r => setTimeout(r, 500));
        }
      }

      if (!fullText) {
        socket.emit("message-error", { msg: "AI Error" });
        return;
      }

      // ================= STREAM RESPONSE =================
      const chunkSize = 20;
      let reply = "";

      for (let i = 0; i < fullText.length; i += chunkSize) {
        const chunk = fullText.slice(i, i + chunkSize);
        reply += chunk;

        socket.emit("message-stream", { delta: chunk });
        await new Promise(r => setTimeout(r, 20));
      }

      // ================= SAVE ASSISTANT MESSAGE =================
      conversation.messages.push({
        role: "assistant",
        content: reply
      });

      // ================= LONG MEMORY UPDATE =================
      if (conversation.messages.length % 6 === 0) {
        try {
          const summaryPrompt = `
لخص المحادثة التالية في 5 أسطر + كلمات مفتاحية:

${conversation.messages.slice(-12).map(m => `${m.role}: ${m.content}`).join("\n")}
`;

          const summaryRes = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: summaryPrompt }],
            temperature: 0.2,
            max_tokens: 200
          });

          conversation.memory.summary =
            summaryRes.choices?.[0]?.message?.content || "";

        } catch (e) {
          log("MEMORY_ERROR", e.message);
        }
      }

      // ================= SAVE =================
      await conversation.save({ validateBeforeSave: false });

      // ================= CACHE =================
      await pubClient.set(cacheKey, reply, { EX: 300 });

      socket.emit("message-stream-done");

      log("INFO", `Processed message for ${socket.user.id}`);

    } catch (err) {
      log("ERROR", err.message);
      socket.emit("message-error", { msg: "Server error" });
    }
  });

  socket.on("disconnect", () => {
    log("INFO", `Disconnected: ${socket.user.id}`);
  });
});

// ================= FRONTEND =================
const frontendPath = path.join(__dirname, "../frontend-react/dist");

app.use(express.static(frontendPath));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ================= START =================
server.listen(process.env.PORT || 5000, () => {
  log("INFO", `Server running on ${process.env.PORT || 5000}`);
});
