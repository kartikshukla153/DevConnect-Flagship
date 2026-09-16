import { io } from "socket.io-client";

let socket = null;
let connectedUserId = null;

const DEFAULT_SOCKET_URL = "http://localhost:5000";

function getSocketUrl() {
  const configuredUrl =
    import.meta.env.VITE_SOCKET_URL ||
    import.meta.env.VITE_API_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/api\/?$/, "");
  }

  return DEFAULT_SOCKET_URL;
}

export function connectProjectSocket(userId) {
  if (!userId) return null;

  if (socket && connectedUserId === userId) {
    return socket;
  }

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  connectedUserId = userId;

  socket = io(getSocketUrl(), {
    query: {
      userId,
    },
    transports: ["polling", "websocket"],
    upgrade: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  });

  return socket;
}

export function getProjectSocket() {
  return socket;
}

export function disconnectProjectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }

  socket = null;
  connectedUserId = null;
}
