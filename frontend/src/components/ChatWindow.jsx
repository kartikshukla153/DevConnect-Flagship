import { useEffect, useRef, useState } from "react";
import axios from "axios";

import {
  getSocket,
  emitTyping,
  emitStopTyping,
} from "../socket/socket";

import useOnlineUsers from "../hooks/useOnlineUsers";

import ChatHeader from "./chat/ChatHeader";
import MessageList from "./chat/MessageList";
import MessageInput from "./chat/MessageInput";
import TypingIndicator from "./chat/TypingIndicator";

function ChatWindow({ conversation }) {
  const conversationId = conversation._id;

  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );
console.log("CURRENT USER");
console.log(currentUser);

console.log("PARTICIPANTS");
console.table(
  conversation.participants.map((p) => ({
    id: p._id,
    name: p.name,
    email: p.email,
  }))
);

  const currentUserId = currentUser.id;

const receiver = conversation.participants.find(
  (u) => u._id !== currentUserId
);
  const onlineUsers = useOnlineUsers();

  const isOnline =
    onlineUsers.includes(receiver._id);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);

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

    socket.on("newMessage", (message) => {
      if (
        message.conversation === conversationId ||
        message.conversation?._id === conversationId
      ) {
        setMessages((prev) => {
          const exists = prev.find(
            (m) => m._id === message._id
          );

          if (exists) return prev;

          return [...prev, message];
        });
      }
    });

    socket.on("typing", ({ senderId }) => {
      if (senderId === receiver._id) {
        setTyping(true);
      }
    });

    socket.on("stopTyping", ({ senderId }) => {
      if (senderId === receiver._id) {
        setTyping(false);
      }
    });

    return () => {
      socket.off("newMessage");
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [conversationId]);

  const sendMessage = async () => {
    if (!text.trim()) return;

    const optimisticMessage = {
      _id: Date.now().toString(),
      text,
      sender: currentUserId,
      conversation: conversationId,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [
      ...prev,
      optimisticMessage,
    ]);

    const messageText = text;

    setText("");

    emitStopTyping(
      currentUserId,
      receiver._id
    );

    try {
      await axios.post(
        `http://localhost:5000/api/messages/${conversationId}`,
        {
          text: messageText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.log(err);

      fetchMessages();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111827] rounded-xl border border-gray-700">

      <ChatHeader
        receiver={receiver}
        isOnline={isOnline}
      />

      <MessageList
        messages={messages}
        currentUser={currentUser}
        bottomRef={bottomRef}
      />

      <TypingIndicator
        typing={typing}
        receiverName={receiver.name}
      />

      <MessageInput
        text={text}
        setText={setText}
        sendMessage={sendMessage}
        onTyping={() =>
          emitTyping(
            currentUserId,
            receiver._id
          )
        }
        onStopTyping={() =>
          emitStopTyping(
            currentUserId,
            receiver._id
          )
        }
      />

    </div>
  );
}

export default ChatWindow;