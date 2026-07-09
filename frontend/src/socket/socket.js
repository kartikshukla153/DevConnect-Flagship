import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (userId) => {
  console.log("connectSocket called with:", userId);

  if (!userId) {
    console.log("No userId. Socket not created.");
    return null;
  }

  if (socket) {
    socket.disconnect();
  }

  socket = io("http://localhost:5000", {
    transports: ["websocket"],
    query: {
      userId,
    },
  });

  socket.on("connect", () => {
    console.log("🟢 SOCKET CONNECTED");
    console.log("Socket ID:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("🔴 SOCKET DISCONNECTED");
  });

  socket.on("onlineUsers", (users) => {
    console.log("🔥 ONLINE USERS RECEIVED:", users);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/* =========================================
   CHAT HELPERS
========================================= */

export const emitTyping = (senderId, receiverId) => {
  if (!socket) return;

  socket.emit("typing", {
    senderId,
    receiverId,
  });
};

export const emitStopTyping = (senderId, receiverId) => {
  if (!socket) return;

  socket.emit("stopTyping", {
    senderId,
    receiverId,
  });
};