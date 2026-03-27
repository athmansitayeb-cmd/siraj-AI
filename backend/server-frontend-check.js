// server-frontend-check.js
import fetch from "node-fetch";
import { io } from "socket.io-client";

const FRONTEND_URL = "https://siraj.software"; // رابط الواجهة
const TOKEN = process.env.SIRAJ_JWT || "ضع_هنا_التوكن_الصالح";

// ====================
// 1️⃣ تحقق من الـ API
async function checkAPI() {
  try {
    const res = await fetch(`${FRONTEND_URL}/api/conversation`, {
      headers: { "Authorization": `Bearer ${TOKEN}` }
    });
    const data = await res.json();
    console.log("✅ API /api/conversation:", data);
  } catch (err) {
    console.error("❌ API ERROR:", err);
  }
}

// ====================
// 2️⃣ تحقق من WebSocket
function checkSocket() {
  const socket = io(FRONTEND_URL, { path: "/chat" });

  socket.on("connect", () => console.log("✅ WebSocket Connected! ID:", socket.id));

  socket.on("message", data => console.log("💬 WebSocket message:", data));

  socket.emit("message", "مرحباً من السيرفر");

  // افصل بعد 5 ثواني
  setTimeout(() => socket.disconnect(), 5000);
}

// ====================
// 3️⃣ تحقق من الصفحة الرئيسية
async function checkFrontend() {
  try {
    const res = await fetch(FRONTEND_URL);
    const text = await res.text();
    console.log("✅ Frontend HTML length:", text.length);
  } catch (err) {
    console.error("❌ Frontend ERROR:", err);
  }
}

// ====================
// نفّذ كل شيء
(async () => {
  await checkAPI();
  await checkFrontend();
  checkSocket();
})();
