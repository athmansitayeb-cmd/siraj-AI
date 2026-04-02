import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import MainLayout from "../layout/MainLayout";
import { motion } from "framer-motion";

function renderMessage(text) {
  if (!text) return "";

  return text
    .replace(/```([\s\S]*?)```/g,
      (_, code) =>
        `<pre class="bg-black text-green-300 p-3 border border-yellow-500 rounded-xl overflow-x-auto">${code}</pre>`
    )
    .replace(/`([^`]+)`/g, "<code class='text-yellow-400'>$1</code>")
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
}

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "🚀 SIRAJ ONLINE" }
  ]);

  const [input, setInput] = useState("");
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const conversationId = "main-chat";

useEffect(() => {
  const token = localStorage.getItem("siraj_token");

  if (!token) {
    console.error("❌ NO TOKEN → socket not started");
    return;
  }

  const socket = io("https://siraj.software", {
    path: "/socket.io",
    transports: ["websocket", "polling"],
    auth: { token }
  });

  socketRef.current = socket;

  socket.on("connect_error", (err) => {
    console.error("SOCKET ERROR:", err.message);
  });

  socket.on("message-stream", (data) => {
    setMessages((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];

      if (last?.role === "assistant") {
        updated[updated.length - 1] = {
          ...last,
          content: last.content + (data.token || "")
        };
      }

      return updated;
    });
  });

  socket.on("message-error", (e) => {
    console.error("SERVER ERROR:", e);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "⚠️ ERROR" }
    ]);
  });

  // LOAD HISTORY
  fetch("https://siraj.software/api/conversation/main-chat", {
    headers: {
      Authorization: "Bearer " + token
    }
  })
    .then(r => r.json())
    .then(d => {
      if (d?.messages) setMessages(d.messages);
    });

  return () => socket.disconnect();
}, []);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const msg = input;
    setInput("");

    setMessages((prev) => [
      ...prev,
      { role: "user", content: msg },
      { role: "assistant", content: "" }
    ]);

    socketRef.current.emit("message", {
      conversationId,
      msg
    });
  };

  return (
    <MainLayout>
      <div className="h-[90vh] flex flex-col bg-black text-yellow-400">

        <div className="p-4 border-b border-yellow-500 text-xl font-bold">
          SIRAJ AI CHAT
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-[70%] p-3 rounded-2xl ${
                m.role === "user"
                  ? "ml-auto bg-yellow-400 text-black"
                  : "bg-gray-900 border border-yellow-500"
              }`}
            >
              <div dangerouslySetInnerHTML={{ __html: renderMessage(m.content) }} />
            </motion.div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-yellow-500 flex gap-2">
          <input
            className="flex-1 p-3 rounded-xl bg-gray-900 border border-yellow-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button
            onClick={sendMessage}
            className="px-6 bg-yellow-400 text-black rounded-xl font-bold"
          >
            Send
          </button>
        </div>

      </div>
    </MainLayout>
  );
}
