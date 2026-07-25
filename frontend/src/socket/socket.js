import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (userId) => {
  if (!userId) return null;

if (socket?.connected) {
  return socket;
}

if (socket) {
  socket.disconnect();
  socket = null;
}

  socket = io("http://localhost:5000", {
    transports: ["websocket"],
    query: {
      userId,
    },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("🟢 SOCKET CONNECTED");
    console.log("Socket ID:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("🔴 SOCKET DISCONNECTED");
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (!socket) return;

  socket.disconnect();
  socket = null;
};

/* ===========================
   CHAT HELPERS
=========================== */

export const emitTyping = (senderId, receiverId, conversationId) => {
  if (!socket) return;

  socket.emit("typing", {
    senderId,
    receiverId,
    conversationId,
  });
};

export const emitStopTyping = (
  senderId,
  receiverId,
  conversationId
) => {
  if (!socket) return;

  socket.emit("stopTyping", {
    senderId,
    receiverId,
    conversationId,
  });
};

export const emitMessageRead = (
  receiverId,
  conversationId
) => {
  if (!socket) return;

  socket.emit("messageRead", {
    receiverId,
    conversationId,
  });
};