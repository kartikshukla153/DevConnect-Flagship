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

  const isOnline = onlineUsers.includes(receiver._id);

  const token = localStorage.getItem("token");

  const bottomRef = useRef(null);

  const [dragging, setDragging] = useState(false);

  const [messages, setMessages] = useState([]);

  const [text, setText] = useState("");

  const [typing, setTyping] = useState(false);

  const [replyingTo, setReplyingTo] =
    useState(null);

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [search, setSearch] = useState("");

  const [uploadProgress, setUploadProgress] =
    useState(0);

  const [uploading, setUploading] =
    useState(false);

  const [summary, setSummary] =
    useState("");

  const [loadingSummary, setLoadingSummary] =
    useState(false);

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

  useEffect(() => {
    const socket = getSocket();

    if (!socket) return;

    const handleNewMessage = (message) => {
      if (
        message.conversation ===
          conversationId ||
        message.conversation?._id ===
          conversationId
      ) {
        setMessages((prev) => [
          ...prev,
          message,
        ]);
      }
    };

    const handleTyping = ({
      conversationId: id,
    }) => {
      if (id === conversationId)
        setTyping(true);
    };

    const handleStopTyping = ({
      conversationId: id,
    }) => {
      if (id === conversationId)
        setTyping(false);
    };

    const replaceMessage = (
      updatedMessage
    ) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === updatedMessage._id
            ? updatedMessage
            : msg
        )
      );
    };

    const handleRead = ({
      conversationId: id,
    }) => {
      if (id !== conversationId) return;

      setMessages((prev) =>
        prev.map((msg) => {
          if (
            msg.sender._id ===
              currentUser.id &&
            !msg.readBy.includes(
              receiver._id
            )
          ) {
            return {
              ...msg,
              readBy: [
                ...msg.readBy,
                receiver._id,
              ],
            };
          }

          return msg;
        })
      );
    };

    socket.on(
      "newMessage",
      handleNewMessage
    );

    socket.on(
      "typing",
      handleTyping
    );

    socket.on(
      "stopTyping",
      handleStopTyping
    );

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
      handleRead
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
        handleRead
      );
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

  const summarizeChat = async () => {
    try {
      setLoadingSummary(true);

      const res = await axios.post(
        "http://localhost:5000/api/ai-summary/chat",
        {
          conversationId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSummary(res.data.summary);
    } catch (err) {
      console.log(err);
      alert("Summary failed");
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-b from-[#121A2A] via-[#0F172A] to-[#0B1220] shadow-2xl shadow-cyan-500/5"
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() =>
        setDragging(false)
      }
      onDrop={(e) => {
        e.preventDefault();

        setDragging(false);

        if (
          e.dataTransfer.files.length > 0
        ) {
          setSelectedFile(
            e.dataTransfer.files[0]
          );
        }
      }}
    >
      {dragging && <DropOverlay />}

      {/* HEADER */}

      <div className="sticky top-0 z-20 border-b border-white/10 bg-[#111827]/90 backdrop-blur-xl">

        <ChatHeader
          receiver={receiver}
          isOnline={isOnline}
          openSummary={summarizeChat}
        />

      </div>

      {/* AI SUMMARY */}

      {summary && (
        <div className="mx-5 mt-5 rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-sky-500/10 to-indigo-500/10 p-6">

          <div className="mb-4 flex items-center justify-between">

            <div>

              <h3 className="text-lg font-bold text-cyan-300">
                ✨ AI Conversation Summary
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Automatically generated overview
              </p>

            </div>

            {loadingSummary && (
              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                Generating...
              </span>
            )}

          </div>

          <pre className="whitespace-pre-wrap font-sans leading-7 text-slate-200">
            {summary}
          </pre>

        </div>
      )}

      {/* SEARCH */}

      <div className="border-b border-white/5 bg-[#111827]/40 px-5 py-4 backdrop-blur">

        <ChatSearch
          search={search}
          setSearch={setSearch}
        />

      </div>

      {/* MESSAGES */}

      <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,#152238_0%,#0B1220_65%)] px-5 py-6">

        <MessageList
          messages={messages.filter((msg) => {
            if (!search.trim()) return true;

            const query =
              search.toLowerCase();

            return (
              msg.text
                ?.toLowerCase()
                .includes(query) ||
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
              </div>

      {/* Upload Progress */}

      {uploading && (
        <div className="border-t border-white/10 bg-[#111827]/90 px-5 py-4 backdrop-blur">

          <div className="mb-2 flex items-center justify-between text-sm">

            <span className="font-medium text-slate-300">
              Uploading attachment...
            </span>

            <span className="font-semibold text-cyan-400">
              {uploadProgress}%
            </span>

          </div>

          <div className="h-2 overflow-hidden rounded-full bg-[#1F2937]">

            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 transition-all duration-300"
              style={{
                width: `${uploadProgress}%`,
              }}
            />

          </div>

        </div>
      )}

      {/* Message Composer */}

      <div className="sticky bottom-0 border-t border-white/10 bg-[#111827]/95 p-5 backdrop-blur-xl">

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

    </div>
  );
}

export default ChatWindow;