import { useEffect } from "react";
import { getSocket } from "../socket/socket";

function useRealtimeNotifications(fetchNotifications) {
  useEffect(() => {
    const socket = getSocket();

    if (!socket) return;

    socket.on("new_notification", () => {
      fetchNotifications();
    });

    return () => {
      socket.off("new_notification");
    };
  }, [fetchNotifications]);
}

export default useRealtimeNotifications;