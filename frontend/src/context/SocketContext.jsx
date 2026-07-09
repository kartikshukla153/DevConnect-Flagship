import { createContext, useContext, useEffect, useState } from "react";
import { connectSocket, disconnectSocket } from "../socket/socket";
import useAuth from "../hooks/useAuth";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();

  const [socket, setSocket] = useState(null);

  const [onlineUsers, setOnlineUsers] = useState([]);

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    const socketInstance = connectSocket(user.id);

    setSocket(socketInstance);

    // ===========================
    // ONLINE USERS
    // ===========================

    socketInstance.on("onlineUsers", (users) => {
      console.log("🔥 ONLINE USERS:", users);
      setOnlineUsers(users);
    });

    // ===========================
    // REALTIME NOTIFICATIONS
    // ===========================

    socketInstance.on("newNotification", (notification) => {
      console.log("🔔 NEW NOTIFICATION");

      console.log(notification);

      setNotifications((prev) => [
        notification,
        ...prev,
      ]);
    });

    return () => {
      socketInstance.off("onlineUsers");
      socketInstance.off("newNotification");

      disconnectSocket();
    };
  }, [user]);

  return (
    <SocketContext.Provider
      value={{
        socket,

        onlineUsers,

        notifications,

        setNotifications,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);