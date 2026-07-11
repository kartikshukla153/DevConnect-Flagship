import { Server } from "socket.io";
import User from "../models/User.js";

let io;

const userSocketMap = {};

// ==========================================
// INITIALIZE SOCKET.IO
// ==========================================
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
    console.log("====================================");
    console.log("🟢 NEW SOCKET CONNECTED");
    console.log("Socket ID:", socket.id);

    const userId = socket.handshake.query.userId;

    console.log("User ID:", userId);

    // ======================================
    // USER CONNECTED
    // ======================================
    if (userId) {
      userSocketMap[userId] = socket.id;

      try {
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          {
            isOnline: true,
            lastSeen: new Date(),
          },
          {
            returnDocument: "after",
          }
        );

        console.log("✅ USER MARKED ONLINE");
        console.log(updatedUser);

        console.log("📡 ONLINE USERS:", Object.keys(userSocketMap));

        io.emit("userOnline", userId);
        io.emit("onlineUsers", Object.keys(userSocketMap));
      } catch (err) {
        console.log("Mongo Update Error:", err.message);
      }
    }

    // ======================================
    // PROJECT ROOMS
    // ======================================

    socket.on("join_project", (projectId) => {
      socket.join(projectId);
      console.log(`📁 Joined Project ${projectId}`);
    });

    socket.on("leave_project", (projectId) => {
      socket.leave(projectId);
      console.log(`📂 Left Project ${projectId}`);
    });

    // ======================================
    // TYPING EVENTS
    // ======================================

    // ======================================
// TYPING EVENTS
// ======================================

socket.on("typing", ({ senderId, receiverId, conversationId }) => {
  const receiverSocketId = userSocketMap[receiverId];

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("typing", {
      senderId,
      conversationId,
    });
  }
});

socket.on("stopTyping", ({ senderId, receiverId, conversationId }) => {
  const receiverSocketId = userSocketMap[receiverId];

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("stopTyping", {
      senderId,
      conversationId,
    });
  }
});

// ======================================
// MESSAGE READ
// ======================================

socket.on("messageRead", ({ receiverId, conversationId }) => {
  const receiverSocketId = userSocketMap[receiverId];

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("messageRead", {
      conversationId,
    });
  }
});

    socket.on("stopTyping", ({ senderId, receiverId }) => {
      const receiverSocketId = userSocketMap[receiverId];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stopTyping", {
          senderId,
        });
      }
    });

    // ======================================
    // DISCONNECT
    // ======================================

    socket.on("disconnect", async () => {
      console.log("====================================");
      console.log("🔴 SOCKET DISCONNECTED");
      console.log("Socket ID:", socket.id);

      if (userId) {
        delete userSocketMap[userId];

        try {
          const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
              isOnline: false,
              lastSeen: new Date(),
            },
            {
              returnDocument: "after",
            }
          );

          console.log("❌ USER MARKED OFFLINE");
          console.log(updatedUser);

          console.log("📡 ONLINE USERS:", Object.keys(userSocketMap));

          io.emit("userOffline", userId);
          io.emit("onlineUsers", Object.keys(userSocketMap));
        } catch (err) {
          console.log("Mongo Update Error:", err.message);
        }
      }
    });
  });
};

// ==========================================
// HELPERS
// ==========================================

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }

  return io;
};

export const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};

export { io };