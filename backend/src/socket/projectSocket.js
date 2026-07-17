import { io } from "socket.io-client";

let socket = null;

export function connectProjectSocket(userId) {
  if (socket) return socket;

  socket = io("http://localhost:5000", {
    query: {
      userId,
    },
    transports: ["websocket"],
  });

  return socket;
}

export function getProjectSocket() {
  return socket;
}

export function disconnectProjectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}