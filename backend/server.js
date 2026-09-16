import dotenv from "dotenv";
dotenv.config();

import http from "http";
import mongoose from "mongoose";

import { validateEnvironment } from "./src/config/env.js";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { initializeSocket } from "./src/socket/socket.js";

validateEnvironment();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

let isShuttingDown = false;

const startServer = async () => {
  try {
    // Connect to MongoDB using the centralized database configuration.
    await connectDB();

    // Initialize Socket.IO only after the database is ready.
    initializeSocket(server);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Backend startup failed:");
    console.error(error?.message || error);

    // Give the error enough time to flush to the terminal.
    process.exitCode = 1;
  }
};

const shutdown = async (signal) => {
  if (isShuttingDown) return;

  isShuttingDown = true;

  console.log(`${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    try {
      if (
        mongoose.connection.readyState === 1 ||
        mongoose.connection.readyState === 2
      ) {
        await mongoose.connection.close();
        console.log("MongoDB connection closed");
      }

      process.exit(0);
    } catch (error) {
      console.error(
        "Error while closing MongoDB connection:",
        error?.message || error
      );

      process.exit(1);
    }
  });

  // Don't hang forever during shutdown.
  setTimeout(() => {
    console.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10000).unref();
};

process.on("uncaughtException", (error) => {
  console.error("UNCAUGHT EXCEPTION");
  console.error(error);

  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("UNHANDLED REJECTION");
  console.error(error);

  process.exit(1);
});

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();