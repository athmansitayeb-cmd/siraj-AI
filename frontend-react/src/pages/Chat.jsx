import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import MainLayout from "../layout/MainLayout";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

/* ================= Arabic numbers ================= */
const arabicNumbers = {
  0: "٠", 1: "١", 2: "٢", 3: "٣", 4: "٤",
  5: "٥", 6: "٦", 7: "٧", 8: "٨", 9: "٩",
};

const toArabic = (t = "") =>
  t.replace(/\d/g, d => arabicNumbers[d]);

const detectMood = (text = "") => {
  const t = text.toLowerCase();
  if (t.includes("ضايع") || t.includes("قلق") || t.includes("مش عارف")) return "lost";
  if (t.includes("ابدأ") || t.includes("هدف") || t.includes("خطة")) return "seeking";
  return "normal";
};

function Cursor() {
  return <span className="inline-block w-2 h-4 bg-yellow-400 ml-1 animate-pulse" />;
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const loadedRef = useRef(false);

  const conversationId = "main-chat";

  /* ================= INIT ================= */
  useEffect(() => {
    const token = localStorage.getItem("siraj_token");
    if (!token) return;

    /* ========== LOAD HISTORY (ONCE) ========== */
    const loadHistory = async () => {
      try {
        const res = await fetch(
          "https://siraj.software/api/conversation/main-chat",
          {
            headers: { Authorization: "Bearer " + token }
          }
        );

        if (!res.ok) return;

        const data = await res.json();

        if (Array.isArray(data?.messages)) {
          setMessages(data.messages);
        }

        loadedRef.current = true;
      } catch (e) {
        console.error("history error", e);
      }
    };

    loadHistory();

    /* ========== SOCKET ========== */
    const socket = io("https://siraj.software", {
      path: "/socket.io",
      transports: ["websocket"],
      auth: { token }
    });

    socketRef.current = socket;

    socket.on("message-stream", (data) => {
      setTyping(false);

      setMessages(prev => {
        const copy = [...prev];
        const last = copy[copy.length - 1];

        if (last?.role === "assistant") {
          copy[copy.length - 1] = {
            ...last,
            content: last.content + (data.token || "")
          };
        }

        return copy;
      });
    });

    socket.on("message-error", (e) => {
      setTyping(false);

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content:
            e.msg === "LIMIT_REACHED"
              ? "🚫 انتهى الحد المجاني — قم بالترقية"
              : "⚠️ خطأ في النظام"
        }
      ]);
    });

    return () => socket.disconnect();
  }, []);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  /* ================= SEND ================= */
  const sendMessage = () => {
    if (!input.trim()) return;

    const msg = input;
    setInput("");
    setTyping(true);

    setMessages(prev => [
      ...prev,
      { role: "user", content: msg },
      { role: "assistant", content: "" }
    ]);

    socketRef.current?.emit("message", {
      conversationId,
      msg
    });
  };

  return (
    <MainLayout>
      <div className="h-[90vh] flex flex-col bg-black text-white">

        {/* HEADER */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="text-yellow-400 font-bold">SIRAJ AI</div>
        </div>

        {/* CHAT */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          <AnimatePresence>
            {messages.map((m, i) => {
              const mood = detectMood(m.content);

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                    m.role === "user"
                      ? "bg-yellow-400 text-black"
                      : "bg-white/5 border border-white/10"
                  }`}>

                    <ReactMarkdown>
                      {toArabic(m.content)}
                    </ReactMarkdown>

                    {m.role === "assistant" && i === messages.length - 1 && typing && (
                      <Cursor />
                    )}

                    {m.role === "assistant" && i === messages.length - 1 && mood === "lost" && (
                      <div className="mt-2 text-xs text-red-400">
                        سراج: ركّز، المشكلة ليست في الطريق.
                      </div>
                    )}

                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="p-4 border-t border-white/10 flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 px-4 py-3 bg-white/5 rounded-xl"
            placeholder="اكتب رسالتك..."
          />

          <button
            onClick={sendMessage}
            className="px-6 bg-yellow-400 text-black rounded-xl"
          >
            إرسال
          </button>
        </div>

      </div>
    </MainLayout>
  );
}
