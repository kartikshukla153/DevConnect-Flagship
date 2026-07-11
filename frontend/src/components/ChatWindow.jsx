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

  // =====================================
  // FETCH MESSAGES
  // =====================================

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

      const socket = getSocket();

      if (socket) {
        socket.emit("messageRead", {
          receiverId: receiver._id,
          conversationId,
        });
      }
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

  // =====================================
  // SOCKET EVENTS
  // =====================================

  useEffect(() => {
    const socket = getSocket();

    if (!socket) return;

    const handleNewMessage = (message) => {
      if (
        message.conversation === conversationId ||
        message.conversation?._id === conversationId
      ) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleTyping = ({ conversationId: id }) => {
      if (id === conversationId) {
        setTyping(true);
      }
    };

    const handleStopTyping = ({ conversationId: id }) => {
      if (id === conversationId) {
        setTyping(false);
      }
    };

    const replaceMessage = (updatedMessage) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === updatedMessage._id
            ? updatedMessage
            : msg
        )
      );
    };

    const handleMessageRead = ({
      conversationId: id,
    }) => {
      if (id !== conversationId) return;

      setMessages((prev) =>
        prev.map((msg) => {
          if (
            msg.sender._id === currentUser.id &&
            !msg.readBy.includes(receiver._id)
          ) {
            return {
              ...msg,
              readBy: [...msg.readBy, receiver._id],
            };
          }

          return msg;
        })
      );
    };

    socket.on("newMessage", handleNewMessage);

    socket.on("typing", handleTyping);

    socket.on("stopTyping", handleStopTyping);

    socket.on(
      "messageUpdated",
      replaceMessage
    );

    socket.on(
      "messageDeleted",
      replaceMessage
    );

    socket.on(
      "messageReactionUpdated",
      replaceMessage
    );

    socket.on(
      "messageRead",
      handleMessageRead
    );

    return () => {
      socket.off(
        "newMessage",
        handleNewMessage
      );

      socket.off(
        "typing",
        handleTyping
      );

      socket.off(
        "stopTyping",
        handleStopTyping
      );

      socket.off(
        "messageUpdated",
        replaceMessage
      );

      socket.off(
        "messageDeleted",
        replaceMessage
      );

      socket.off(
        "messageReactionUpdated",
        replaceMessage
      );

      socket.off(
        "messageRead",
        handleMessageRead
      );
    };
  }, [conversationId]);

  // =====================================
  // TYPING
  // =====================================

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

  // =====================================
  // SEND MESSAGE
  // =====================================

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