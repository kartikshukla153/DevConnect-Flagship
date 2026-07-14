  import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import aiDocsRoutes from "./routes/aiDocsRoutes.js";

import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/Post.js";
import profileRoutes from "./routes/profileRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import connectionRoutes from "./routes/connectionRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import aiChatRoutes from "./routes/aiChatRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import projectChatRoutes from "./routes/projectChatRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import aiReviewRoutes from "./routes/aiReviewRoutes.js";
import aiCodeRoutes from "./routes/aiCodeRoutes.js";
import aiBugRoutes from "./routes/aiBugRoutes.js";
const app = express();

// ==========================================
// ES MODULE __dirname
// ==========================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================
// MIDDLEWARE
// =========================

app.use(cors());

app.use(express.json());
app.use("/api/ai-docs", aiDocsRoutes);
app.use("/api/ai-code", aiCodeRoutes);
app.use("/api/ai-chat", aiChatRoutes);
app.use("/api/ai", aiReviewRoutes);
app.use("/api/ai-bug", aiBugRoutes);
// ==========================================
// STATIC FILES
// ==========================================

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "../uploads")
  )
);

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
app.use("/api/ai", aiRoutes);
// =========================
// HEALTH CHECK
// =========================

app.get("/", (req, res) => {
  res.send("DevConnect API running...");
});

export default app;