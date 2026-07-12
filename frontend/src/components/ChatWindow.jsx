import { useEffect, useRef, useState } from "react";
import axios from "axios";
import DropOverlay from "./chat/DropOverlay";
import { getSocket } from "../socket/socket";
import useOnlineUsers from "../hooks/useOnlineUsers";
import ChatSearch from "./chat/ChatSearch";

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
  const [dragging, setDragging] = useState(false);

  const isOnline = onlineUsers.includes(receiver._id);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [search, setSearch] = useState("");
const [uploadProgress, setUploadProgress] = useState(0);
const [uploading, setUploading] = useState(false);
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

  setUploading(false);
  setUploadProgress(0);
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
  if (!text.trim() && !selectedFile) return;

  try {
    setUploading(true);
setUploadProgress(0);
    const formData = new FormData();

    formData.append("text", text);

    if (replyingTo) {
      formData.append("replyTo", replyingTo._id);
    }

    if (selectedFile) {
      formData.append(
        "attachment",
        selectedFile
      );
    }
    console.log("Selected File:", selectedFile);

for (let pair of formData.entries()) {
  console.log(pair[0], pair[1]);
}

    const res = await axios.post(
  `http://localhost:5000/api/messages/${conversationId}`,
  formData,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },

    onUploadProgress: (progressEvent) => {
    const percent = Math.round(
  (progressEvent.loaded * 100) /
    (progressEvent.total || 1)
);

      setUploadProgress(percent);
    },
  }
);

    setText("");
    setReplyingTo(null);
    setSelectedFile(null);
    setUploading(false);
setUploadProgress(0);

    setMessages((prev) => [
  ...prev,
  res.data.data,
]);

  } catch (err) {
    console.log(err);
  }
};

  return (
  <div
  className="relative flex flex-col h-full bg-[#111827] rounded-xl border border-gray-700"
  onDragOver={(e) => {
    e.preventDefault();
    setDragging(true);
  }}
  onDragLeave={() => setDragging(false)}
  onDrop={(e) => {
    e.preventDefault();

    setDragging(false);

    if (e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  }}
> {dragging && <DropOverlay />}
      <ChatHeader
        receiver={receiver}
        isOnline={isOnline}
      />
      <ChatSearch
  search={search}
  setSearch={setSearch}
/>

     <MessageList
  messages={messages.filter((msg) => {
    if (!search.trim()) return true;

    const query = search.toLowerCase();

    return (
      msg.text?.toLowerCase().includes(query) ||
      msg.attachment?.originalName
        ?.toLowerCase()
        .includes(query)
    );
  })}
  currentUser={currentUser}
  bottomRef={bottomRef}
  setReplyingTo={setReplyingTo}
  search={search}
/>
      <TypingIndicator
        typing={typing}
        receiverName={receiver.name}
      />

{uploading && (
  <div className="mx-4 mb-2 rounded-lg bg-[#1F2937] p-3">
    <div className="mb-1 flex justify-between text-sm text-white">
      <span>Uploading...</span>
      <span>{uploadProgress}%</span>
    </div>

    <div className="h-2 overflow-hidden rounded-full bg-gray-700">
      <div
        className="h-full bg-cyan-400 transition-all"
        style={{
          width: `${uploadProgress}%`,
        }}
      />
    </div>
  </div>
)}
      <MessageInput
  text={text}
  setText={setText}
  sendMessage={sendMessage}
  onTyping={handleTyping}
  onStopTyping={handleStopTyping}
  replyingTo={replyingTo}
  setReplyingTo={setReplyingTo}
  selectedFile={selectedFile}
  setSelectedFile={setSelectedFile}
/>
    </div>
  );
}

export default ChatWindow;