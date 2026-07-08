import { createContext, useContext, useEffect, useState } from "react";
import { connectSocket, disconnectSocket } from "../socket/socket";
import useAuth from "../hooks/useAuth";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();

  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    const socketInstance = connectSocket(user.id);

    setSocket(socketInstance);

    socketInstance.on("onlineUsers", (users) => {
      console.log("🔥 ONLINE USERS:", users);
      setOnlineUsers(users);
    });

    return () => {
      socketInstance.off("onlineUsers");
      disconnectSocket();
    };
  }, [user]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);