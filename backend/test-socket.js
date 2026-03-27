import { io } from "socket.io-client";

const socket = io("https://siraj.software", {
  path: "/socket.io",           // تأكد أن هذا هو path الصحيح في backend
  auth: { token: process.env.VITE_JWT },  // استخدم نفس الـ token الذي يعمل مع API
  transports: ["polling", "websocket"],  // أضف polling أولاً للتأكد من upgrade
  rejectUnauthorized: false     // إذا كان SSL self-signed
});

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ Connection error:", err.message, err);
});
