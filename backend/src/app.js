import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/Post.js";
import profileRoutes from "./routes/profileRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/posts", postRoutes);

app.use("/api/profile", profileRoutes);

app.use("/api/search", searchRoutes);

app.use("/api/projects", projectRoutes);

app.use("/api/tasks", taskRoutes);

// =========================
// HEALTH CHECK
// =========================

app.get("/", (req, res) => {
  res.send("DevConnect API running...");
});

export default app;