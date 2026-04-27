import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import MainLayout from "../layout/MainLayout";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const conversationId = "main-chat";

  useEffect(() => {
    const token = localStorage.getItem("siraj_token");
    if (!token) return;

    fetch("https://siraj.software/api/conversation/main-chat", {
      headers: { Authorization: "Bearer " + token }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data?.messages)) setMessages(data.messages);
      });

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

    socket.on("message-error", () => {
      setTyping(false);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "⚠️ System error occurred." }
      ]);
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

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
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
          <div className="text-yellow-400 font-bold tracking-wide">
            SIRAJ AI
          </div>
          <div className="text-xs text-gray-500">
            Active Session
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`
                    max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md
                    ${m.role === "user"
                      ? "bg-yellow-400 text-black rounded-br-md"
                      : "bg-white/5 border border-white/10 text-gray-200 rounded-bl-md"
                    }
                  `}
                >
                  <ReactMarkdown>
                    {m.content || ""}
                  </ReactMarkdown>

                  {m.role === "assistant" && i === messages.length - 1 && typing && (
                    <span className="inline-flex mt-2 gap-1">
                      <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce delay-75" />
                      <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce delay-150" />
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {/* INPUT BAR */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-3 items-center bg-white/5 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-yellow-400">

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 bg-transparent outline-none text-sm"
              placeholder="Type your message..."
            />

            <button
              onClick={sendMessage}
              className="px-5 py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:scale-105 transition"
            >
              Send
            </button>

          </div>
        </div>

      </div>
    </MainLayout>
  );
}
