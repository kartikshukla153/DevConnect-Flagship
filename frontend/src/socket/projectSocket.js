import { io } from "socket.io-client";

let socket = null;

export const connectProjectSocket = (userId) => {
  if (socket) return socket;

  socket = io("http://localhost:5000", {
    query: {
      userId,
    },
    transports: ["websocket"],
  });

  return socket;
};

export const getProjectSocket = () => socket;

export const disconnectProjectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};