// frontend-react/src/pages/Chat.jsx
import { useState, useEffect, useRef } from "react";
import MainLayout from "../layout/MainLayout";
import { motion } from "framer-motion";
import io from "socket.io-client";
import axios from "axios";

export default function Chat() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Welcome to SIRAJ AI Chat." }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // ===== WebSocket Connection for live events =====
  useEffect(() => {
    const token = localStorage.getItem("siraj_token");
    socketRef.current = io("https://siraj.software", {
      path: "/chat",
      auth: { token }
    });

    socketRef.current.on("connect", () => console.log("✅ Connected to SIRAJ server"));

    socketRef.current.on("message", (data) => {
      setTyping(true);
      const text = data.response;
      let index = 0;
      const interval = setInterval(() => {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last.sender === "bot" && !last.finished) {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...last,
              text: last.text + text[index],
              finished: index === text.length - 1
            };
            return updated;
          } else if (index === 0) {
            return [...prev, { sender: "bot", text: text[0], finished: text.length === 1 }];
          }
          return prev;
        });
        index++;
        if (index >= text.length) {
          clearInterval(interval);
          setTyping(false);
        }
      }, 20);
    });

    return () => socketRef.current.disconnect();
  }, []);

  // ===== Scroll to bottom =====
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // ===== Send Message via REST API =====
  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages([...messages, { sender: "user", text: input }]);

    try {
      const res = await axios.post(
        "https://siraj.software/api/chat",
        { message: input },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.reply) {
        setMessages((prev) => [...prev, { sender: "bot", text: res.data.reply }]);
      }
    } catch (err) {
      console.error("API Error:", err.response ? err.response.data : err.message);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ خطأ في الاتصال بالذكاء الاصطناعي." }
      ]);
    }

    setInput("");
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[75vh] bg-black rounded-3xl shadow-xl overflow-hidden p-4 gap-4 relative">
        <div className="flex-1 overflow-y-auto space-y-3">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-md px-4 py-3 rounded-2xl ${
                msg.sender === "user"
                  ? "ml-auto bg-yellow-400 text-black"
                  : "bg-gray-800 text-yellow-400"
              }`}
            >
              {msg.text}
            </motion.div>
          ))}
          {typing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-md px-4 py-3 rounded-2xl bg-gray-800 text-yellow-400"
            >
              SIRAJ is typing...
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleEnter}
            placeholder="Type your message..."
            className="flex-1 p-3 rounded-xl border border-yellow-400 bg-black text-yellow-400"
          />
          <button onClick={sendMessage} className="btn">
            Send
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
