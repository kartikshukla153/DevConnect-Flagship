import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  query: {
    userId: "6a1fb159dd8ea8440ba4888c",
  },
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  socket.emit(
    "join_project",
    "6a38b56c328b3b0f0b40925f"
  );

  console.log("Listening for project messages...");
});

socket.on(
  "new_project_message",
  (message) => {
    console.log("\n========== NEW MESSAGE ==========");
    console.log(message);
    console.log("=================================\n");
  }
);