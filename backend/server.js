import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";

import app from "./src/app.js";
import { initializeSocket } from "./src/socket/socket.js";

dotenv.config();
dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

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
    console.error(err);
  });

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION");
  console.error(err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION");
  console.error(err);
});