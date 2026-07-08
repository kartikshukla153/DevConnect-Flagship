import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";

import authRoutes from "./src/routes/auth.js";
import postRoutes from "./src/routes/Post.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import projectRoutes from "./src/routes/projectRoutes.js";
import connectionRoutes from "./src/routes/connectionRoutes.js";
import messageRoutes from "./src/routes/messageRoutes.js";
import conversationRoutes from "./src/routes/conversationRoutes.js";
import searchRoutes from "./src/routes/searchRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import taskRoutes from "./src/routes/taskRoutes.js";
import projectChatRoutes from "./src/routes/projectChatRoutes.js";

import { initializeSocket } from "./src/socket/socket.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// =========================
// MIDDLEWARE
// =========================

app.use(cors());
app.use(express.json());

// =========================
// ROUTES
// =========================

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/project-chat", projectChatRoutes);

// =========================
// HEALTH CHECK
// =========================

app.get("/", (req, res) => {
  res.send("DevConnect API running...");
});

// =========================
// DATABASE CONNECTION
// =========================

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    initializeSocket(server);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:");
    console.error(err);
  });

// =========================
// DEBUGGING
// =========================

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION");
  console.error(err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION");
  console.error(err);
});