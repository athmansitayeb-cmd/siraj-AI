import React, { useState, useEffect, useRef } from "react";
import { socket } from "../socket";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { trackEvent } from "../analytics";
import { useParams } from "react-router-dom";

export default function Chat({ isGuest = false }) {

 // ================= IDs =================
const { workspaceId } = useParams();

useEffect(() => {
 if (!workspaceId) {
 console.error("Missing workspaceId");
 window.location.href = "/intent";
 }
}, [workspaceId]);

const [workspace, setWorkspace] = useState(null);

useEffect(() => {
 const loadWorkspace = async () => {
 try {
 const res = await fetch(
 `/api/workspace/${workspaceId}`,
 {
 headers: {
 Authorization:
 "Bearer " + localStorage.getItem("siraj_token")
 }
 }
 );

 const data = await res.json();

 setWorkspace(data);

 } catch (err) {
 console.error("Workspace load error:", err);
 }
 };

 if (workspaceId) {
 loadWorkspace();
 }

}, [workspaceId]);

const [conversationId] = useState(() => {
 const key = `conversation:${workspaceId}`;
 const existing = localStorage.getItem(key);

 if (existing) return existing;

 const id = crypto.randomUUID();
 localStorage.setItem(key, id);

 return id;
});

 // ================= AUTH =================
 const token = isGuest ? null : localStorage.getItem("siraj_token");

 // ================= STATE =================
 const [messages, setMessages] = useState([]);
 const [input, setInput] = useState("");
 const [typing, setTyping] = useState(false);
 const [loadingHistory, setLoadingHistory] = useState(true);
 const [blocked, setBlocked] = useState(false);
 const [limitModal, setLimitModal] = useState(null);

 // ================= REFS =================
 const socketRef = useRef(null);
 const bottomRef = useRef(null);

 // ================= TRACK =================
 useEffect(() => {
 trackEvent("open_chat");
 }, []);

 // ================= LOAD HISTORY =================
 useEffect(() => {
 if (!token || isGuest) {
 setLoadingHistory(false);
 return;
 }

if (!conversationId) {
 setLoadingHistory(false);
 return;
}

 const loadConversation = async () => {
 try {
 setLoadingHistory(true);

 const res = await fetch(
 `https://siraj.software/api/conversation/${conversationId}`,
 {
 headers: {
 Authorization: "Bearer " + token,
 },
 }
 );

 const data = await res.json();

 if (Array.isArray(data?.messages)) {
 setMessages(data.messages);
 }
 } catch (err) {
 console.error("History load error:", err);
 } finally {
 setLoadingHistory(false);
 }
 };

 loadConversation();
 }, [conversationId, token, isGuest]);

 // ================= SOCKET =================
 useEffect(() => {
 socketRef.current = socket;

 const onStream = (data) => {
 setTyping(true);

 setMessages((prev) => {
 const copy = [...prev];
 const last = copy[copy.length - 1];

 if (last?.role === "assistant") {
 copy[copy.length - 1] = {
 ...last,
 content: (last.content || "") + (data.token || ""),
 };
 }

 return copy;
 });
 };

 const onEnd = () => setTyping(false);

 const onLimit = (data) => {
 setTyping(false);
 setBlocked(true);

 setLimitModal({
 title: data.title,
 message: data.message,
 });

 trackEvent("limit_hit");
 };

 const onError = (data) => {
 setTyping(false);

 setMessages((prev) => [
 ...prev,
 {
 role: "assistant",
 content:
 data?.msg === "too_short"
 ? "⚠️ Message too short."
 : data?.msg === "message_too_long"
 ? "⚠️ Message too long."
 : "⚠️ System error.",
 },
 ]);
 };

 socketRef.current.on("message-stream", onStream);
 socketRef.current.on("message-stream-end", onEnd);
 socketRef.current.on("try-limit-reached", onLimit);
 socketRef.current.on("message-error", onError);

 return () => {
 socketRef.current.off("message-stream", onStream);
 socketRef.current.off("message-stream-end", onEnd);
 socketRef.current.off("try-limit-reached", onLimit);
 socketRef.current.off("message-error", onError);
 };
 }, []);

 // ================= AUTO SCROLL =================
 useEffect(() => {
 bottomRef.current?.scrollIntoView({ behavior: "smooth" });
 }, [messages, typing]);

 // ================= SEND =================
 const sendMessage = () => {
 if (!input.trim() || typing || blocked) return;

 const msg = input;
 setInput("");

 setMessages((prev) => [
 ...prev,
 { role: "user", content: msg },
 { role: "assistant", content: "" },
 ]);

 socketRef.current?.emit("message", {
 conversationId,
 workspaceId,
 msg,
 isGuest,
 });

 trackEvent("message_sent", { workspaceId });
 };

 // ================= UI =================
 return (
 <div className="flex flex-col h-screen">

 {/* HEADER */}
 <header className="border-b border-[var(--border)]">
 <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-blue-500/10 text-blue-400">
 <Sparkles size={18} />
 </div>

 <div>
 <div className="font-semibold">
 {workspace?.intent || "SIRAJ AI"}
 </div>
 <div className="text-sm text-muted">Enterprise Runtime</div>
 </div>
 </div>

 <div className="px-3 py-2 rounded-full text-xs font-medium bg-green-500/10 text-green-600">
 ONLINE
 </div>
 </div>
 </header>

 {/* BODY */}
 <main className="flex-1 overflow-y-auto px-4 py-8">
 <div className="max-w-4xl mx-auto">

 {/* EMPTY */}
 {!loadingHistory && messages.length === 0 && (
 <div className="text-center mt-28">
 <h1 className="text-5xl font-bold tracking-tight mb-5">
 Ask anything
 </h1>

 <p className="text-lg text-muted max-w-2xl mx-auto">
 Build agents, automate workflows, orchestrate intelligence.
 </p>
 </div>
 )}

 {/* LOADING */}
 {loadingHistory && (
 <div className="flex justify-center py-20">
 <Loader2 className="animate-spin" size={32} />
 </div>
 )}

 {/* MESSAGES */}
 <AnimatePresence>
 {messages.map((m, i) => (
 <motion.div
 key={i}
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 className={`flex mb-5 ${
 m.role === "user" ? "justify-end" : "justify-start"
 }`}
 >
 <div
 className={`max-w-[85%] rounded-3xl px-5 py-4 text-sm leading-7 shadow-soft border ${
 m.role === "user"
 ? "bg-[var(--primary)] text-[var(--text)] border-transparent"
 : "glass"
 }`}
 >
 <ReactMarkdown>{m.content}</ReactMarkdown>
 </div>
 </motion.div>
 ))}
 </AnimatePresence>

 {/* TYPING */}
 {typing && (
 <div className="mb-6 text-sm text-muted">
 SIRAJ thinking...
 </div>
 )}

 <div ref={bottomRef} />
 </div>
 </main>

 {/* INPUT */}
 <footer className="border-t border-[var(--border)]">
 <div className="max-w-4xl mx-auto flex items-center gap-3 px-4 py-4">

 <div className="flex-1 flex items-center gap-3 rounded-3xl px-4 py-3 glass">
 <textarea
 rows={1}
 value={input}
 disabled={blocked}
 placeholder={blocked ? "Upgrade required" : "Message SIRAJ..."}
 onChange={(e) => setInput(e.target.value)}
 onKeyDown={(e) => {
 if (e.key === "Enter" && !e.shiftKey) {
 e.preventDefault();
 sendMessage();
 }
 }}
 className="flex-1 resize-none bg-transparent outline-none text-sm"
 />
 </div>

 <button
 onClick={sendMessage}
 disabled={blocked || typing}
 className="btn-primary h-[56px] px-6 rounded-2xl"
 >
 <Send size={18} />
 </button>
 </div>
 </footer>

 {/* MODAL */}
 <AnimatePresence>
 {limitModal && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.6)]"
 >
 <motion.div
 initial={{ scale: 0.95 }}
 animate={{ scale: 1 }}
 className="w-full max-w-md glass p-8 text-center"
 >
 <div className="text-sm text-red-500 mb-3 tracking-[0.2em]">
 LIMIT REACHED
 </div>

 <h2 className="text-2xl font-bold mb-3">
 {limitModal.title}
 </h2>

 <p className="text-muted mb-7">
 {limitModal.message}
 </p>

 <button
 className="btn-primary w-full"
 onClick={() => (window.location.href = "/upgrade")}
 >
 Upgrade
 </button>

 <button
 className="mt-4 text-sm text-muted"
 onClick={() => setLimitModal(null)}
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
