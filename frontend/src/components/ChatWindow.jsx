import { useEffect, useRef, useState } from "react";
import axios from "axios";

import { getSocket } from "../socket/socket";
import OnlineIndicator from "./OnlineIndicator";
import useOnlineUsers from "../hooks/useOnlineUsers";
import formatLastSeen from "../utils/formatLastSeen";

function ChatWindow({ conversation }) {
  const conversationId = conversation._id;

  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );

  const receiver =
    conversation.participants.find(
      (u) => u._id !== currentUser._id
    );

  const onlineUsers = useOnlineUsers();

  const isOnline =
    onlineUsers.includes(receiver._id);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const bottomRef = useRef(null);

  const token = localStorage.getItem("token");

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/messages/${conversationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages(res.data.messages);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    const socket = getSocket();

    if (!socket) return;

    socket.on("receive_message", (message) => {
      if (message.conversation === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [conversationId]);

  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      await axios.post(
        "http://localhost:5000/api/messages",
        {
          conversationId,
          text,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setText("");

      fetchMessages();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111827] rounded-xl border border-gray-700">

      <div className="border-b border-gray-700 p-4 flex items-center gap-3">

        <OnlineIndicator online={isOnline} />

        <div>

          <h2 className="font-bold text-lg">
            {receiver.name}
          </h2>

          <p className="text-sm text-gray-400">
            {isOnline
              ? "Online"
              : formatLastSeen(receiver.lastSeen)}
          </p>

        </div>

      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {messages.map((msg) => (

          <div
            key={msg._id}
            className={`px-4 py-2 rounded-lg max-w-[70%] ${
              msg.sender === currentUser._id
                ? "bg-cyan-500 ml-auto"
                : "bg-gray-700"
            }`}
          >
            {msg.text}
          </div>

        ))}

        <div ref={bottomRef} />

      </div>

      <div className="flex border-t border-gray-700">

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
          className="flex-1 bg-transparent p-4 outline-none"
        />

        <button
          onClick={sendMessage}
          className="px-6 bg-cyan-500 text-black font-semibold"
        >
          Send
        </button>

      </div>

    </div>
  );
}

export default ChatWindow;