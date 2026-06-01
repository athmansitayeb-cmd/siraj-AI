import { io } from "socket.io-client";

const getToken = () => localStorage.getItem("siraj_token");

export const socket = io("https://siraj.software", {
  path: "/socket.io",
  transports: ["websocket"],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  auth: {
    token: getToken()
  }
});
