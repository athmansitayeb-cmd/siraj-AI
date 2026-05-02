import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const token = localStorage.getItem("siraj_token");
  const conversationId = "main-chat";

  if (!token) {
    return <div className="text-white p-10">Unauthorized</div>;
  }

  useEffect(() => {
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
        { role: "assistant", content: "⚠️ Error" }
      ]);
    });

    return () => socket.disconnect();
  }, [token]);

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
    <div className="h-screen flex flex-col bg-black text-white">

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        <AnimatePresence>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm ${
                m.role === "user"
                  ? "bg-yellow-400 text-black"
                  : "bg-white/5 border border-white/10 text-gray-200"
              }`}>
                <ReactMarkdown>{m.content || ""}</ReactMarkdown>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex gap-3">

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 bg-white/5 p-2 rounded"
          />

          <button
            onClick={sendMessage}
            className="bg-yellow-400 text-black px-4 rounded"
          >
            Send
          </button>

        </div>
      </div>

    </div>
  );
}
