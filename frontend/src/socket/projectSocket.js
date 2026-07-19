import { io } from "socket.io-client";

let socket;

export function connectProjectSocket(
  userId
) {
  if (
    socket &&
    socket.connected
  ) {
    return socket;
  }

  socket = io(
    "http://localhost:5000",
    {
      transports: ["websocket"],
      query: {
        userId,
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      autoConnect: true,
    }
  );

  return socket;
}

export function getProjectSocket() {
  return socket;
}

export function disconnectProjectSocket() {
  if (!socket) return;

  socket.disconnect();

  socket = null;
}