import { useEffect, useRef, useState } from "react";
import axios from "axios";

import { getSocket } from "../socket/socket";
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

  const receiver = conversation.participants.find(
    (u) => u._id !== currentUser.id
  );

  const onlineUsers = useOnlineUsers();

  const isOnline = onlineUsers.includes(receiver._id);
 const [messages, setMessages] = useState([]);
const [text, setText] = useState("");
const [typing, setTyping] = useState(false);

const [replyingTo, setReplyingTo] = useState(null);

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
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on("typing", ({ conversationId: id }) => {
      if (id === conversationId) {
        setTyping(true);
      }
    });

    socket.on("stopTyping", ({ conversationId: id }) => {
      if (id === conversationId) {
        setTyping(false);
      }
    });

    socket.on(
      "messageReactionUpdated",
      (updatedMessage) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === updatedMessage._id
              ? updatedMessage
              : msg
          )
        );
      }
    );

    return () => {
      socket.off("newMessage");
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("messageReactionUpdated");
    };
  }, [conversationId]);
const handleTyping = () => {
  const socket = getSocket();

  if (!socket) return;

  socket.emit("typing", {
    senderId: currentUser.id,
    receiverId: receiver._id,
    conversationId,
  });
};

const handleStopTyping = () => {
  const socket = getSocket();

  if (!socket) return;

  socket.emit("stopTyping", {
    senderId: currentUser.id,
    receiverId: receiver._id,
    conversationId,
  });
};
  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      await axios.post(
  `http://localhost:5000/api/messages/${conversationId}`,
  {
    text,
    replyTo: replyingTo?._id || null,
  },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setText("");
setReplyingTo(null);

fetchMessages();
    } catch (err) {
      console.log(err);
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
  setReplyingTo={setReplyingTo}
/>

      <TypingIndicator
        typing={typing}
        receiverName={receiver.name}
      />

      <MessageInput
  text={text}
  setText={setText}
  sendMessage={sendMessage}
  onTyping={handleTyping}
  onStopTyping={handleStopTyping}
  replyingTo={replyingTo}
  setReplyingTo={setReplyingTo}
/>

    </div>
  );
}

export default ChatWindow;