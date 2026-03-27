import { io } from "socket.io-client";

const socket = io("https://siraj.software", {
  path: "/chat",           // المسار الصحيح
  transports: ["websocket"], // websocket أو polling حسب تجربتك
  auth: {
    token: process.env.VITE_JWT
  }
});

socket.on("connect", () => console.log("✅ Connected"));
socket.on("connect_error", (err) => console.log("❌ Connection error:", err));
