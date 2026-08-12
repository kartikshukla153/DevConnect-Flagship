import dotenv from "dotenv";
import { validateEnvironment } from "./src/config/env.js";
dotenv.config();
validateEnvironment();
import mongoose from "mongoose";
import http from "http";

import app from "./src/app.js";
import { initializeSocket } from "./src/socket/socket.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const requiredEnv = [
  "MONGO_URI",
  "JWT_SECRET",
];

const missingEnv = requiredEnv.filter(
  (key) => !process.env[key]
);

if (missingEnv.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnv.join(", ")}`
  );

  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    initializeSocket(server);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:");
    console.error(err.message);
    process.exit(1);
  });

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION");
  console.error(err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION");
  console.error(err);
  process.exit(1);
});

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
      process.exit(0);
    } catch (error) {
      console.error(
        "Error while closing MongoDB connection:",
        error.message
      );

      process.exit(1);
    }
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));