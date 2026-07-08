import { useSocket } from "../context/SocketContext";

export default function useOnlineUsers() {
  const { onlineUsers } = useSocket();

  return onlineUsers || [];
}