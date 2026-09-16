import { io } from "socket.io-client";

let socket = null;

function getSocketUrl() {
  const configured = import.meta.env.VITE_SOCKET_URL;

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const apiUrl = (
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"
  ).replace(/\/$/, "");

  return apiUrl.replace(/\/api$/, "");
}

export const connectSocket = (userId) => {
  if (!userId) return null;

  if (socket) {
    const existingUserId = socket.io?.opts?.query?.userId;

    if (
      socket.connected &&
      String(existingUserId) === String(userId)
    ) {
      return socket;
    }

    socket.disconnect();
    socket = null;
  }

  socket = io(getSocketUrl(), {
    transports: ["websocket"],
    query: { userId },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
    autoConnect: true,
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (!socket) return;

  socket.disconnect();
  socket = null;
};

export const emitTyping = (senderId, receiverId, conversationId) => {
  socket?.emit("typing", {
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
  socket?.emit("stopTyping", {
    senderId,
    receiverId,
    conversationId,
  });
};

export const emitMessageRead = (receiverId, conversationId) => {
  socket?.emit("messageRead", {
    receiverId,
    conversationId,
  });
};