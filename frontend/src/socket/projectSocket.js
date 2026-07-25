import {
  connectSocket,
  getSocket,
  disconnectSocket,
} from "./socket";

/*
===========================================
Temporary Compatibility Wrapper

This keeps the old API working while the
project migrates to a single global socket.

After migration this file will be deleted.
===========================================
*/

export function connectProjectSocket(userId) {
  return connectSocket(userId);
}

export function getProjectSocket() {
  return getSocket();
}

export function disconnectProjectSocket() {
  // Intentionally empty.
  // The global socket is owned by SocketContext.
}