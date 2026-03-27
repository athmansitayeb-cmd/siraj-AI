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
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { createClient } from "redis";
import Groq from "groq-sdk";

import connectDB from "./config/db.js";
import Conversation from "./models/Conversation.js";

dotenv.config({ path: "/opt/siraj/backend/.env", override: true });

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

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120
}));

app.use(cors({
  origin: "https://siraj.software",
  credentials: true
}));

app.use(express.json());

// ================= REDIS =================
const redis = createClient({ url: process.env.REDIS_URL });

redis.on("error", () => {
  console.log("Redis error / fallback mode active");
});

await redis.connect();

// ================= LOG =================
function log(type, msg) {
  const line = `[${new Date().toISOString()}][${type}] ${msg}\n`;
  fs.appendFileSync("logs/server.log", line);
  console.log(line.trim());
}

// ================= SERVER =================
const server = http.createServer(app);

// ================= SOCKET =================
const io = new Server(server, {
  cors: {
    origin: "https://siraj.software",
    credentials: true
  }
});

// ================= AUTH =================
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("NO_TOKEN"));

    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new Error("BAD_TOKEN"));
  }
});

// ================= GROQ =================
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ================= MEMORY GUARD =================
function isValidMemory(text) {
  if (!text || typeof text !== "string") return false;

  const badPatterns = [
    "أنا اسمي",
    "اسمك",
    "أنت هو",
    "هو اسمه",
    "you are",
    "your name"
  ];

  return !badPatterns.some(p => text.includes(p));
}

function extractImportance(text) {
  const triggers = ["اسمي", "أحب", "أفضل", "لا أحب", "هدفي", "أعمل"];
  let score = 0.3;

  for (const t of triggers) {
    if (text.includes(t)) score += 0.25;
  }

  return Math.min(score, 1);
}

function smartRecall(items, query) {
  if (!items?.length) return [];

  const q = query.toLowerCase();

  return items
    .map(m => {
      let score = m.importance || 0.3;
      if ((m.text || "").toLowerCase().includes(q)) score += 0.6;
      return { ...m, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

function buildPrompt(summary, profile) {
  return `
أنت سراج، نظام ذكي عربي.

ملخص المستخدم:
${summary || "فارغ"}

ملف المستخدم:
${JSON.stringify(profile || {}, null, 2)}

قواعد:
- لا تخترع معلومات
- استخدم الذاكرة فقط عند الحاجة
- كن دقيق ومباشر
`;
}

// ================= SOCKET CORE =================
io.on("connection", (socket) => {
  log("INFO", `Connected ${socket.user.id}`);

  socket.on("message", async (msg) => {
    try {
      if (!msg || typeof msg !== "string") return;

      let conversation = await Conversation.findOne({ userId: socket.user.id });

      if (!conversation) {
        conversation = new Conversation({
          userId: socket.user.id,
          messages: [],
          memory: { summary: "", items: [] },
          profile: { facts: {} },
        });
      }

      conversation.messages ??= [];
      conversation.memory ??= { summary: "", items: [] };
      conversation.memory.items = Array.isArray(conversation.memory.items)
        ? conversation.memory.items
        : [];
      conversation.profile ??= { facts: {} };

      const normalizedMsg = msg.trim().toLowerCase();

      const cacheKey = `chat:${socket.user.id}:${conversation.messages.length}:${normalizedMsg}`;

      const cached = await redis.get(cacheKey);
      if (cached) {
        socket.emit("message-start");
        socket.emit("message-stream", { delta: cached });
        socket.emit("message-stream-done");
        return;
      }

      conversation.messages.push({ role: "user", content: msg });

      if (isValidMemory(msg)) {
        conversation.memory.items.push({
          text: msg,
          importance: extractImportance(msg),
          type: "episodic",
          time: new Date(),
        });
      }

      const recent = conversation.messages.slice(-12);
      const relevant = smartRecall(conversation.memory.items, msg);

      const memoryBlock = relevant
        .map(m => `• ${m.text} (i:${(m.importance ?? 0.3).toFixed(2)})`)
        .join("\n");

      let fullText = "";
      let attempts = 0;

      while (attempts < 2 && !fullText) {
        try {
          const res = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: buildPrompt(conversation.memory.summary, conversation.profile) },
              { role: "system", content: `ذاكرة:\n${memoryBlock || "لا شيء"}` },
              ...recent
            ],
            temperature: 0.7,
            max_tokens: 700
          });

          fullText = res.choices?.[0]?.message?.content || "";
        } catch {
          attempts++;
        }
      }

      if (!fullText) {
        socket.emit("message-error", { msg: "AI_FAIL" });
        return;
      }

      socket.emit("message-start");

      let reply = "";

      for (let i = 0; i < fullText.length; i += 25) {
        const chunk = fullText.slice(i, i + 25);
        reply += chunk;

        socket.emit("message-stream", { delta: chunk });
        await new Promise(r => setTimeout(r, 10));
      }

      socket.emit("message-stream-done");

      conversation.messages.push({ role: "assistant", content: reply });

      const safeReply =
        isValidMemory(reply) && reply.length < 300;

      if (safeReply) {
        conversation.memory.items.push({
          text: reply,
          importance: extractImportance(reply),
          type: "episodic",
          time: new Date(),
        });
      }

      conversation.profile.lastInteraction = new Date();
      conversation.profile.memorySize = conversation.memory.items.length;

      if (conversation.messages.length % 6 === 0) {
        try {
          const summaryText = conversation.messages
            .slice(-18)
            .map(m => `${m.role}: ${m.content}`)
            .join("\n");

          const summary = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "user",
                content: `حلل المستخدم:\n${summaryText}`
              }
            ],
            temperature: 0.2,
            max_tokens: 250
          });

          const rawSummary = summary.choices?.[0]?.message?.content || "";

          const isSafeSummary =
            !/(اسم|أنت|you are|his name|he is|she is)/i.test(rawSummary);

          if (isSafeSummary) {
            conversation.memory.summary = rawSummary;
          }

          log("MEMORY", "SUMMARY UPDATED");
        } catch (e) {
          log("MEMORY_ERROR", e.message);
        }
      }

      await conversation.save();
      await redis.setEx(cacheKey, 300, reply);

    } catch (err) {
      log("ERROR", err.message);
      socket.emit("message-error", { msg: "SERVER_ERROR" });
    }
  });

  socket.on("disconnect", () => {
    log("INFO", `Disconnected ${socket.user.id}`);
  });
});

// ================= HEALTH =================
app.get("/api/health", (req, res) => {
  res.json({
    server: "OK",
    mongo: mongoose.connection.readyState === 1 ? "OK" : "DOWN",
    redis: redis.isOpen ? "OK" : "DOWN"
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
  log("INFO", `SIRAJ ONLINE ${process.env.PORT || 5000}`);
});
