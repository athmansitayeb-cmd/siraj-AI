import React, { useState, useEffect, useRef } from "react";
import { socket } from "../socket";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { trackEvent } from "../analytics";

export default function Chat() {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const recognitionRef = useRef(null);
  const [voiceMode, setVoiceMode] = useState(false);

  const [blocked, setBlocked] = useState(false);
  const [limitModal, setLimitModal] = useState(null);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const token = localStorage.getItem("siraj_token");

  const [conversationId] = useState(
    localStorage.getItem("siraj_conversation") || crypto.randomUUID()
  );

  // ================= INIT =================
  useEffect(() => {
    trackEvent("open_chat");
  }, []);

  // ================= SOCKET =================
  useEffect(() => {

    socketRef.current = socket;

    // STREAM
    socketRef.current.on("message-stream", (data) => {
      setTyping(true);

      setMessages(prev => {
        const copy = [...prev];
        const last = copy[copy.length - 1];

        if (last?.role === "assistant") {
          copy[copy.length - 1] = {
            ...last,
            content: (last.content || "") + (data.token || "")
          };
        }

        return copy;
      });
    });

socketRef.current.on("message-stream-end", () => {

  setTyping(false);

  setMessages(prev => {

    const last = prev[prev.length - 1];

    if (
      last &&
      last.role === "assistant" &&
      last.content
    ) {
      speakText(last.content);
    }

    return prev;
  });
});

    // ================= LIMIT SYSTEM =================
    socketRef.current.on("try-limit-reached", (data) => {
      setTyping(false);
      setBlocked(true);

      setLimitModal({
        title: data.title,
        message: data.message
      });

      // UX tracking (important for funnel)
      trackEvent("limit_hit");
    });

    socketRef.current.on("message-error", (data) => {
      setTyping(false);

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content:
  data.msg === "too_short"
    ? "⚠️ Message too short."
    : data.msg === "message_too_long"
    ? "⚠️ Message too long."
    : "⚠️ System error."

        }
      ]);
    });

    return () => {
     socketRef.current.off("message-stream");
     socketRef.current.off("message-stream-end");
     socketRef.current.off("try-limit-reached");
     socketRef.current.off("message-error");
   };

  }, [token]);

  // ================= SCROLL =================
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // ================= SEND =================
const sendMessage = () => {
  if (!input.trim() || typing || blocked) return;

  const msg = input;
  setInput("");

  setMessages(prev => [
    ...prev,
    { role: "user", content: msg },
    { role: "assistant", content: "" }
  ]);

  socketRef.current?.emit("message", {
    conversationId,
    msg
  });

  trackEvent("message_sent");

};

const toggleVoiceMode = () => {
  setVoiceMode(v => !v);

  if (listening) {
    recognitionRef.current?.stop();
    setListening(false);
  }

  window.speechSynthesis?.cancel();
};

// ================= VOICE INPUT =================
const startVoice = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) return;

  // إذا شغال → وقف
  if (recognitionRef.current) {
    recognitionRef.current.stop();
    recognitionRef.current = null;
    setListening(false);
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "ar-DZ";
  recognition.continuous = false;
  recognition.interimResults = true;

recognition.onstart = () => {
  setListening(true);

  navigator.vibrate?.(40);
};
  
  recognition.onerror = () => {
    setListening(false);
    recognitionRef.current = null;
  };

  recognition.onresult = (event) => {
    let transcript = "";

    for (let i = 0; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }

    setInput(transcript);
  };

  recognition.onend = () => {
    setListening(false);
    recognitionRef.current = null;

    setTimeout(() => {
      setInput(prev => {
        if (prev.trim().length > 1) {
          socketRef.current?.emit("message", {
            conversationId,
            msg: prev
          });

          setMessages(prevMsgs => [
            ...prevMsgs,
            { role: "user", content: prev },
            { role: "assistant", content: "" }
          ]);

          trackEvent("voice_message_sent");

          return "";
        }
        return prev;
      });
    }, 120);
  };

  recognitionRef.current = recognition;
  recognition.start();
};

// ================= SPEAK =================
const speakText = (text) => {
  if (!voiceEnabled || !voiceMode) return;

  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel();

const utterance = new SpeechSynthesisUtterance(text);

utterance.lang = /[ء-ي]/.test(text)
  ? "ar-SA"
  : "en-US";

utterance.rate = 1;
utterance.pitch = 1;
utterance.volume = 1;

  utterance.onend = () => {
    // 🔥 auto listen بعد ما يكمل الكلام
    if (voiceMode) {
      setTimeout(() => startVoice(), 500);
    }
  };

  window.speechSynthesis.resume();

  window.speechSynthesis.speak(utterance);
};

  // ================= UI =================
  return (
    <div className="h-screen flex flex-col bg-siraj text-white relative overflow-hidden">

      {/* ================= HEADER ================= */}
      <div className="px-6 py-4 border-b border-white/5 flex justify-between backdrop-blur-xl bg-black/20">
        <div className="text-yellow-400 tracking-[0.3em] text-sm font-semibold">
          SIRAJ AI
        </div>

        <div className="text-xs text-gray-500">
          Neural System v3
        </div>
      </div>

      {/* ================= CHAT ================= */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 flex justify-center">
        <div className="w-full max-w-2xl space-y-5">

          {messages.length === 0 && (
            <div className="text-center mt-24">
              <h1 className="text-2xl font-light">Ask anything</h1>
              <p className="text-gray-600 text-sm mt-2">
                Build systems, automate workflows, scale intelligence.
              </p>
            </div>
          )}

          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[85%]">

                  <div className={`
                    px-4 py-3 text-sm leading-relaxed
                    rounded-2xl border whitespace-pre-wrap
                    ${m.role === "user"
                      ? "bg-yellow-400 text-black"
                      : "bg-white/5 border-white/10 text-gray-200"}
                  `}>
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>

                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* typing */}
          {typing && (
            <div className="flex gap-2 px-2 text-gray-500 text-sm">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
              <span className="ml-2 text-xs">SIRAJ thinking</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

{/* ================= INPUT ================= */}
<div className="px-4 md:px-8 pb-6">
  <div className="max-w-2xl mx-auto flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2 backdrop-blur-xl">

    {/* TEXT INPUT */}
    <input
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      placeholder={blocked ? "Upgrade required" : "Message SIRAJ..."}
      disabled={blocked}
      className="flex-1 bg-transparent outline-none text-sm disabled:opacity-40"
    />

{/* VOICE MODE SWITCH */}
<button
  onClick={toggleVoiceMode}
  className={`
    w-10 h-10 rounded-full flex items-center justify-center
    border transition-all backdrop-blur-xl

    ${voiceMode
      ? "bg-red-500/20 border-red-400 scale-110"
      : "bg-white/5 border-white/10"}
  `}
>
  <div className={`
    w-2 h-2 rounded-full
    ${voiceMode ? "bg-red-400 animate-pulse" : "bg-white/60"}
  `}/>
</button>

{voiceMode && (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="
      fixed bottom-28 left-1/2 -translate-x-1/2
      px-4 py-2 rounded-full
      bg-black/70 border border-red-400/30
      backdrop-blur-2xl
      text-xs text-red-300
      z-50
    "
  >
    🎧 Voice Mode Active
  </motion.div>
)}

{listening && voiceMode && (
  <div className="absolute -top-6 text-[10px] text-red-400 animate-pulse">
    listening...
  </div>
)}

    {/* MICROPHONE (VOICE MODE PRO MAX) */}
    <button
      onClick={startVoice}
      disabled={blocked}
      className={`
        relative w-14 h-14 md:w-12 md:h-12 rounded-full
        flex items-center justify-center
        transition-all duration-300
        border overflow-hidden backdrop-blur-xl

        ${listening
          ? "bg-red-500/20 border-red-400/40 scale-110 shadow-[0_0_25px_rgba(255,0,0,0.35)]"
          : "bg-white/5 border-white/10 hover:bg-white/10"}
      `}
    >

      {/* pulse ring */}
      {listening && (
        <span className="absolute inset-0 rounded-full animate-ping bg-red-400/20" />
      )}

      {/* waveform */}
      <div className="flex items-end gap-[2px] z-10">
        {[1,2,3,4].map(i => (
          <div
            key={i}
            className={`
              w-[2px] rounded-full transition-all duration-200
              ${listening
                ? "bg-red-400 h-6 animate-bounce"
                : "bg-white/50 h-2"}
            `}
            style={{ animationDelay: `${i * 70}ms` }}
          />
        ))}
      </div>

    </button>

    {/* SEND */}
    <button
      onClick={sendMessage}
      disabled={blocked}
      className="bg-yellow-400 text-black px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
    >
      Send
    </button>

  </div>

  {/* VOICE STATUS (mobile clean) */}
  {listening && (
    <div className="flex items-center justify-center mt-2 gap-2 text-xs text-red-400 animate-pulse">
      <div className="flex gap-[2px]">
        {[1,2,3,4].map(i => (
          <div
            key={i}
            className="w-[2px] h-3 bg-red-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
      Voice Engine Pro Max active
    </div>
  )}
</div>

      {/* ================= PAYWALL OVERLAY ================= */}
      <AnimatePresence>
        {limitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50"
          >

            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 text-center"
            >

              <div className="text-red-400 text-xs tracking-[0.3em] mb-3">
                LIMIT REACHED
              </div>

              <h2 className="text-xl font-semibold mb-3">
                {limitModal.title}
              </h2>

              <p className="text-gray-400 text-sm mb-6">
                {limitModal.message}
              </p>

              <button
onClick={() => {

  if (limitModal?.title?.includes("أكمل")) {

    trackEvent("register_click");
    window.location.href = "/register";

  } else {

    trackEvent("upgrade_click");
    window.location.href = "/upgrade";

  }

}}
                className="w-full bg-yellow-400 text-black py-3 rounded-xl font-semibold hover:scale-[1.02] transition"
              >
                {limitModal?.title?.includes("أكمل")
  ? "Create Free Account"
  : "Upgrade to Pro"}
              </button>

              <button
                onClick={() => setLimitModal(null)}
                className="mt-3 text-gray-500 text-xs"
              >
                Maybe later
              </button>

            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
