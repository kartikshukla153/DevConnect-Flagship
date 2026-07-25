import { createContext, useContext, useEffect, useState } from "react";
import {
  connectProjectSocket,
  disconnectProjectSocket,
} from "../socket/projectSocket";
import useAuth from "../hooks/useAuth";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();

  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    const socketInstance = connectProjectSocket(user.id);

    setSocket(socketInstance);

    socketInstance.on("onlineUsers", (users) => {
      console.log("🔥 ONLINE USERS:", users);
      setOnlineUsers(users);
    });

    socketInstance.on(
      "newNotification",
      (notification) => {
        console.log("🔔 NEW NOTIFICATION");

        setNotifications((prev) => [
          notification,
          ...prev,
        ]);
      }
    );

    return () => {
      socketInstance.off("onlineUsers");
      socketInstance.off("newNotification");

      // Don't disconnect here.
      // ProjectWorkspace also uses the same socket.
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

export const useSocket = () =>
  useContext(SocketContext);