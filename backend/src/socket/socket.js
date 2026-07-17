import { Server } from "socket.io";
import User from "../models/User.js";

let io;

const userSocketMap = {};

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  console.log("✅ Socket.IO Initialized");

  io.on("connection", async (socket) => {
    console.log("🟢 Socket Connected:", socket.id);

    const userId = socket.handshake.query.userId;

    // =============================
    // USER ONLINE
    // =============================

    if (userId) {
      userSocketMap[userId] = socket.id;

      try {
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          lastSeen: new Date(),
        });

        io.emit("userOnline", userId);
        io.emit("onlineUsers", Object.keys(userSocketMap));
      } catch (err) {
        console.log(err.message);
      }
    }

    // =============================
    // PROJECT ROOM
    // =============================

    socket.on("join_project", (projectId) => {
      socket.join(projectId);
      console.log(`📁 Joined ${projectId}`);
    });

    socket.on("leave_project", (projectId) => {
      socket.leave(projectId);
      console.log(`📂 Left ${projectId}`);
    });

    // =============================
    // PROJECT TYPING
    // =============================

    socket.on("project_typing", ({ projectId, user }) => {
      socket.to(projectId).emit("project_typing", {
        user,
      });
    });

    socket.on("project_stop_typing", (projectId) => {
      socket.to(projectId).emit("project_stop_typing");
    });

    // =============================
    // PRIVATE CHAT TYPING
    // =============================

    socket.on(
      "typing",
      ({ senderId, receiverId, conversationId }) => {
        const receiverSocketId =
          userSocketMap[receiverId];

        if (receiverSocketId) {
          io.to(receiverSocketId).emit(
            "typing",
            {
              senderId,
              conversationId,
            }
          );
        }
      }
    );

    socket.on(
      "stopTyping",
      ({ senderId, receiverId, conversationId }) => {
        const receiverSocketId =
          userSocketMap[receiverId];

        if (receiverSocketId) {
          io.to(receiverSocketId).emit(
            "stopTyping",
            {
              senderId,
              conversationId,
            }
          );
        }
      }
    );

    // =============================
    // MESSAGE READ
    // =============================

    socket.on(
      "messageRead",
      ({ receiverId, conversationId }) => {
        const receiverSocketId =
          userSocketMap[receiverId];

        if (receiverSocketId) {
          io.to(receiverSocketId).emit(
            "messageRead",
            {
              conversationId,
            }
          );
        }
      }
    );

    // =============================
    // DISCONNECT
    // =============================

    socket.on("disconnect", async () => {
      console.log("🔴 Socket Disconnected");

      if (userId) {
        delete userSocketMap[userId];

        try {
          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: new Date(),
          });

          io.emit("userOffline", userId);
          io.emit(
            "onlineUsers",
            Object.keys(userSocketMap)
          );
        } catch (err) {
          console.log(err.message);
        }
      }
    });
  });
};

export const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.IO not initialized"
    );
  }

  return io;
};

export const getReceiverSocketId = (
  userId
) => {
  return userSocketMap[userId];
};

export { io };