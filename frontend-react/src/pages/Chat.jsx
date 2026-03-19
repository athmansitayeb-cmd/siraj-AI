import { useState, useRef, useEffect } from "react";
import MainLayout from "../layout/MainLayout";
import axios from "axios";
import { motion } from "framer-motion";

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "🚀 Welcome to SIRAJ Ultra AI" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("/api/chat", {
        message: input,
        history: messages
      });

      setMessages([...newMessages, {
        role: "assistant",
        content: res.data.reply
      }]);

    } catch {
      setMessages([...newMessages, {
        role: "assistant",
        content: "⚠️ AI Error"
      }]);
    }

    setLoading(false);
  };

  return (
    <MainLayout>
      <div className="h-[85vh] flex flex-col bg-black rounded-3xl border border-yellow-400 shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="p-4 border-b border-yellow-400 text-yellow-400 font-bold">
          SIRAJ ULTRA AI
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={m.role === "user" ? "text-right" : "text-left"}
            >
              <div className={`
                inline-block px-4 py-3 rounded-2xl max-w-md
                ${m.role === "user"
                  ? "bg-yellow-400 text-black"
                  : "bg-gray-800 text-yellow-400 border border-yellow-400/20"}
              `}>
                {m.content}
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className="text-yellow-400 text-sm animate-pulse">
              SIRAJ is thinking...
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-yellow-400 flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Ask anything..."
            className="flex-1 p-3 rounded-xl bg-black border border-yellow-400 text-yellow-400 outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <button
            onClick={sendMessage}
            className="px-6 py-3 bg-yellow-400 text-black rounded-xl font-bold hover:scale-105 transition"
          >
            Send
          </button>
        </div>

      </div>
    </MainLayout>
  );
}
