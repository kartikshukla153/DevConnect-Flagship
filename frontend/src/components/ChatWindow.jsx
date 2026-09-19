import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import {
  ArrowDown,
  Check,
  Clipboard,
  FileText,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";

import DropOverlay from "./chat/DropOverlay";
import { getSocket } from "../socket/socket";
import useOnlineUsers from "../hooks/useOnlineUsers";

import ChatSearch from "./chat/ChatSearch";
import ChatHeader from "./chat/ChatHeader";
import MessageList from "./chat/MessageList";
import MessageInput from "./chat/MessageInput";
import TypingIndicator from "./chat/TypingIndicator";

const API = "http://localhost:5000/api";

function getUserId(user) {
  return user?.id || user?._id || null;
}

function getConversationId(value) {
  if (!value) return null;

  return typeof value === "string"
    ? value
    : value?._id || null;
}

function ChatWindow({ conversation }) {
  const conversationId = conversation?._id;

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const currentUserId = getUserId(currentUser);

  const receiver = useMemo(() => {
    const participants = Array.isArray(
      conversation?.participants
    )
      ? conversation.participants
      : [];

    return (
      participants.find(
        (user) =>
          String(user?._id) !==
          String(currentUserId)
      ) || null
    );
  }, [
    conversation?.participants,
    currentUserId,
  ]);

  const onlineUsers = useOnlineUsers();

  const isOnline = receiver
    ? onlineUsers.some(
        (id) =>
          String(id) ===
          String(receiver._id)
      )
    : false;

  const token = localStorage.getItem("token");

  const bottomRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const autoScrollRef = useRef(true);
  const messagesRef = useRef([]);

  const [dragging, setDragging] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] =
    useState(true);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [replyingTo, setReplyingTo] =
    useState(null);
  const [selectedFile, setSelectedFile] =
    useState(null);
  const [search, setSearch] = useState("");
  const [uploadProgress, setUploadProgress] =
    useState(0);
  const [uploading, setUploading] = useState(false);

  const [summary, setSummary] = useState("");
  const [summaryVisible, setSummaryVisible] =
    useState(false);
  const [loadingSummary, setLoadingSummary] =
    useState(false);
  const [summaryCopied, setSummaryCopied] =
    useState(false);

  const [showJumpToLatest, setShowJumpToLatest] =
    useState(false);
  const [newMessagesWhileAway, setNewMessagesWhileAway] =
    useState(0);

  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] =
    useState("");

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const replaceMessage = useCallback(
    (updatedMessage) => {
      if (!updatedMessage?._id) return;

      setMessages((prev) =>
        prev.map((message) =>
          String(message._id) ===
          String(updatedMessage._id)
            ? updatedMessage
            : message
        )
      );
    },
    []
  );

  const markConversationRead =
    useCallback(async () => {
      if (!conversationId || !token) return;

      try {
        await axios.put(
          `${API}/messages/read/${conversationId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const socket = getSocket();

        if (socket && receiver?._id) {
          socket.emit("messageRead", {
            receiverId: receiver._id,
            conversationId,
          });
        }

        window.dispatchEvent(
          new CustomEvent(
            "devconnect:messages-read",
            {
              detail: {
                conversationId,
              },
            }
          )
        );
      } catch (error) {
        console.error(
          "MARK MESSAGES AS READ ERROR:",
          error.response?.data ||
            error.message
        );
      }
    }, [
      conversationId,
      receiver?._id,
      token,
    ]);

  const scrollToLatest = useCallback(
    (behavior = "smooth") => {
      bottomRef.current?.scrollIntoView({
        behavior,
        block: "end",
      });

      autoScrollRef.current = true;
      setShowJumpToLatest(false);
      setNewMessagesWhileAway(0);
    },
    []
  );

  const fetchMessages = useCallback(
    async () => {
      if (!conversationId || !token) {
        setMessages([]);
        setLoadingMessages(false);
        return;
      }

      try {
        setLoadingMessages(true);
        setLoadError("");
        setActionError("");
        setSearch("");
        setTyping(false);
        setReplyingTo(null);
        setNewMessagesWhileAway(0);
        setShowJumpToLatest(false);
        autoScrollRef.current = true;

        const res = await axios.get(
          `${API}/messages/${conversationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const nextMessages =
          res.data?.messages || [];

        setMessages(nextMessages);

        await markConversationRead();

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            scrollToLatest("auto");
          });
        });
      } catch (error) {
        console.error(
          "FETCH MESSAGES ERROR:",
          error.response?.data ||
            error.message
        );

        setLoadError(
          error.response?.data?.message ||
            "Unable to load this conversation."
        );
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    },
    [
      conversationId,
      token,
      markConversationRead,
      scrollToLatest,
    ]
  );

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    const container =
      messagesContainerRef.current;

    if (!container) return;

    const handleScroll = () => {
      const distanceFromBottom =
        container.scrollHeight -
        container.scrollTop -
        container.clientHeight;

      const nearBottom =
        distanceFromBottom < 140;

      autoScrollRef.current = nearBottom;

      if (nearBottom) {
        setShowJumpToLatest(false);
        setNewMessagesWhileAway(0);
      } else {
        setShowJumpToLatest(true);
      }
    };

    container.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    handleScroll();

    return () => {
      container.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [conversationId]);

  useEffect(() => {
    const socket = getSocket();

    if (!socket) return;

    const handleNewMessage = (message) => {
      const messageConversationId =
        getConversationId(
          message?.conversation
        );

      if (
        String(messageConversationId) !==
        String(conversationId)
      ) {
        return;
      }

      const senderId = getConversationId(
        message?.sender
      );

      const isOwnMessage =
        currentUserId &&
        senderId &&
        String(senderId) ===
          String(currentUserId);

      const alreadyExists = messagesRef.current.some(
        (existing) =>
          String(existing._id) ===
          String(message._id)
      );

      setMessages((prev) => {
        if (alreadyExists) {
          return prev.map((existing) =>
            String(existing._id) ===
            String(message._id)
              ? message
              : existing
          );
        }

        return [...prev, message];
      });

      if (!alreadyExists) {
        if (
          !isOwnMessage &&
          !autoScrollRef.current
        ) {
          setNewMessagesWhileAway(
            (count) => count + 1
          );
          setShowJumpToLatest(true);
        }

        if (autoScrollRef.current) {
          requestAnimationFrame(() => {
            scrollToLatest();
          });
        }
      }

      if (!isOwnMessage) {
        markConversationRead();
      }
    };

    const handleTypingEvent = ({
      conversationId: id,
    }) => {
      if (
        String(id) ===
        String(conversationId)
      ) {
        setTyping(true);
      }
    };

    const handleStopTypingEvent = ({
      conversationId: id,
    }) => {
      if (
        String(id) ===
        String(conversationId)
      ) {
        setTyping(false);
      }
    };

    const handleMessageUpdated = (
      updatedMessage
    ) => {
      const messageConversationId =
        getConversationId(
          updatedMessage?.conversation
        );

      if (
        messageConversationId &&
        String(messageConversationId) !==
          String(conversationId)
      ) {
        return;
      }

      replaceMessage(updatedMessage);
    };

    const handleMessageDeleted = (
      updatedMessage
    ) => {
      const messageConversationId =
        getConversationId(
          updatedMessage?.conversation
        );

      if (
        messageConversationId &&
        String(messageConversationId) !==
          String(conversationId)
      ) {
        return;
      }

      replaceMessage(updatedMessage);
    };

    const handleReactionUpdated = (
      updatedMessage
    ) => {
      const messageConversationId =
        getConversationId(
          updatedMessage?.conversation
        );

      if (
        messageConversationId &&
        String(messageConversationId) !==
          String(conversationId)
      ) {
        return;
      }

      replaceMessage(updatedMessage);
    };

    const handleRead = ({
      conversationId: id,
    }) => {
      if (
        String(id) !==
        String(conversationId)
      ) {
        return;
      }

      setMessages((prev) =>
        prev.map((message) => {
          const senderId =
            getConversationId(
              message?.sender
            );

          const readBy = Array.isArray(
            message?.readBy
          )
            ? message.readBy
            : [];

          if (
            String(senderId) ===
              String(currentUserId) &&
            receiver?._id &&
            !readBy.some(
              (userId) =>
                String(userId) ===
                String(receiver._id)
            )
          ) {
            return {
              ...message,
              readBy: [
                ...readBy,
                receiver._id,
              ],
            };
          }

          return message;
        })
      );
    };

    socket.on(
      "newMessage",
      handleNewMessage
    );
    socket.on(
      "typing",
      handleTypingEvent
    );
    socket.on(
      "stopTyping",
      handleStopTypingEvent
    );
    socket.on(
      "messageUpdated",
      handleMessageUpdated
    );
    socket.on(
      "messageDeleted",
      handleMessageDeleted
    );
    socket.on(
      "messageReactionUpdated",
      handleReactionUpdated
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
        handleTypingEvent
      );
      socket.off(
        "stopTyping",
        handleStopTypingEvent
      );
      socket.off(
        "messageUpdated",
        handleMessageUpdated
      );
      socket.off(
        "messageDeleted",
        handleMessageDeleted
      );
      socket.off(
        "messageReactionUpdated",
        handleReactionUpdated
      );
      socket.off(
        "messageRead",
        handleRead
      );
    };
  }, [
    conversationId,
    currentUserId,
    receiver?._id,
    markConversationRead,
    replaceMessage,
    scrollToLatest,
  ]);

  const handleTyping = () => {
    const socket = getSocket();

    if (!socket || !receiver?._id) return;

    socket.emit("typing", {
      senderId: currentUserId,
      receiverId: receiver._id,
      conversationId,
    });
  };

  const handleStopTyping = () => {
    const socket = getSocket();

    if (!socket || !receiver?._id) return;

    socket.emit("stopTyping", {
      senderId: currentUserId,
      receiverId: receiver._id,
      conversationId,
    });
  };

  const sendMessage = async () => {
    const trimmedText = text.trim();

    if (!trimmedText && !selectedFile) {
      return;
    }

    try {
      setActionError("");
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();

      formData.append("text", trimmedText);

      if (replyingTo?._id) {
        formData.append(
          "replyTo",
          replyingTo._id
        );
      }

      if (selectedFile) {
        formData.append(
          "attachment",
          selectedFile
        );
      }

      const res = await axios.post(
        `${API}/messages/${conversationId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (
            progressEvent
          ) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) /
                (progressEvent.total || 1)
            );

            setUploadProgress(percent);
          },
        }
      );

      const createdMessage =
        res.data?.data;

      setText("");
      setReplyingTo(null);
      setSelectedFile(null);
      setUploading(false);
      setUploadProgress(0);

      if (createdMessage) {
        setMessages((prev) => {
          const alreadyExists = prev.some(
            (message) =>
              String(message._id) ===
              String(createdMessage._id)
          );

          if (alreadyExists) {
            return prev.map((message) =>
              String(message._id) ===
              String(createdMessage._id)
                ? createdMessage
                : message
            );
          }

          return [
            ...prev,
            createdMessage,
          ];
        });

        requestAnimationFrame(() => {
          scrollToLatest();
        });
      }
    } catch (error) {
      console.error(
        "SEND MESSAGE ERROR:",
        error.response?.data ||
          error.message
      );

      setUploading(false);
      setUploadProgress(0);

      setActionError(
        error.response?.data?.message ||
          "Unable to send the message. Please try again."
      );
    }
  };

  const handleEditMessage = async (
    message,
    nextText
  ) => {
    if (!message?._id) return false;

    const trimmedText =
      typeof nextText === "string"
        ? nextText.trim()
        : "";

    if (!trimmedText) {
      return false;
    }

    if (
      trimmedText ===
      message.text?.trim()
    ) {
      return true;
    }

    try {
      setActionError("");

      const res = await axios.put(
        `${API}/messages/edit/${message._id}`,
        {
          text: trimmedText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedMessage =
        res.data?.data;

      if (updatedMessage) {
        replaceMessage(updatedMessage);
      }

      return true;
    } catch (error) {
      console.error(
        "EDIT MESSAGE ERROR:",
        error.response?.data ||
          error.message
      );

      setActionError(
        error.response?.data?.message ||
          "Unable to edit this message."
      );

      return false;
    }
  };

  const handleDeleteMessage = async (
    message
  ) => {
    if (!message?._id) return;

    const confirmed = window.confirm(
      "Delete this message? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setActionError("");

      const res = await axios.delete(
        `${API}/messages/${message._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const deletedMessage =
        res.data?.data;

      if (deletedMessage) {
        replaceMessage(deletedMessage);
      }
    } catch (error) {
      console.error(
        "DELETE MESSAGE ERROR:",
        error.response?.data ||
          error.message
      );

      setActionError(
        error.response?.data?.message ||
          "Unable to delete this message."
      );
    }
  };

  const handleReactMessage = async (
    message,
    emoji = "❤️"
  ) => {
    if (!message?._id) return;

    try {
      setActionError("");

      const res = await axios.put(
        `${API}/messages/reaction/${message._id}`,
        {
          emoji,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedMessage =
        res.data?.data;

      if (updatedMessage) {
        replaceMessage(updatedMessage);
      }
    } catch (error) {
      console.error(
        "REACTION ERROR:",
        error.response?.data ||
          error.message
      );

      setActionError(
        error.response?.data?.message ||
          "Unable to update the reaction."
      );
    }
  };

  const generateSummary = async () => {
    if (!conversationId || !token) {
      return;
    }

    try {
      setSummaryVisible(true);
      setLoadingSummary(true);
      setSummaryCopied(false);
      setActionError("");

      const res = await axios.post(
        `${API}/ai-summary/chat`,
        {
          conversationId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSummary(
        res.data?.summary || ""
      );
    } catch (error) {
      console.error(
        "SUMMARY ERROR:",
        error.response?.data ||
          error.message
      );

      setSummaryVisible(false);

      setActionError(
        error.response?.data?.message ||
          "Unable to generate the conversation summary."
      );
    } finally {
      setLoadingSummary(false);
    }
  };

  const summarizeChat = async () => {
    if (summary && !loadingSummary) {
      setSummaryVisible(true);
      return;
    }

    await generateSummary();
  };

  const refreshSummary = async () => {
    await generateSummary();
  };

  const copySummary = async () => {
    if (!summary) return;

    try {
      await navigator.clipboard.writeText(
        summary
      );

      setSummaryCopied(true);

      window.setTimeout(() => {
        setSummaryCopied(false);
      }, 1800);
    } catch (error) {
      console.error(
        "COPY SUMMARY ERROR:",
        error
      );

      setActionError(
        "Unable to copy the summary."
      );
    }
  };

  const filteredMessages = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return messages;
    }

    return messages.filter(
      (message) =>
        message.text
          ?.toLowerCase()
          .includes(query) ||
        message.attachment?.originalName
          ?.toLowerCase()
          .includes(query)
    );
  }, [messages, search]);

  const attachmentCount = useMemo(
    () =>
      messages.filter(
        (message) =>
          message?.attachment?.url ||
          message?.attachment?.originalName
      ).length,
    [messages]
  );

  const formatLastSeen = (date) => {
    if (!date) return "Offline";

    const parsed = new Date(date);

    if (
      Number.isNaN(parsed.getTime())
    ) {
      return "Offline";
    }

    const diff =
      Date.now() - parsed.getTime();

    if (diff < 60 * 1000) {
      return "Last seen just now";
    }

    if (diff < 60 * 60 * 1000) {
      return `Last seen ${Math.floor(
        diff / (60 * 1000)
      )}m ago`;
    }

    if (diff < 24 * 60 * 60 * 1000) {
      return `Last seen ${Math.floor(
        diff / (60 * 60 * 1000)
      )}h ago`;
    }

    return `Last seen ${parsed.toLocaleDateString(
      [],
      {
        day: "numeric",
        month: "short",
      }
    )}`;
  };

  const summaryLines = useMemo(() => {
    if (!summary) return [];

    return summary
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }, [summary]);

  if (!conversationId || !receiver) {
    return (
      <div className="flex h-full items-center justify-center rounded-[30px] border border-white/10 bg-[#0B1220] p-8 text-center">
        <div className="max-w-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
            <FileText size={26} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-white">
            Conversation unavailable
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            We could not resolve the developer
            associated with this conversation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-b from-[#121A2A] via-[#0F172A] to-[#0B1220] shadow-2xl shadow-cyan-500/5"
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => {
        setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);

        const file =
          event.dataTransfer.files?.[0];

        if (file) {
          setSelectedFile(file);
          setActionError("");
        }
      }}
    >
      {dragging && <DropOverlay />}

      {/* Conversation header */}
      <div className="relative z-30 shrink-0 border-b border-white/10 bg-[#111827]/90 backdrop-blur-xl">
        <ChatHeader
          receiver={receiver}
          isOnline={isOnline}
          openSummary={summarizeChat}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 px-5 py-2.5 text-[11px]">
          <div className="flex min-w-0 items-center gap-3 text-slate-500">
            <span className="truncate">
              {isOnline
                ? "Available now"
                : formatLastSeen(
                    receiver.lastSeen
                  )}
            </span>

            <span className="h-1 w-1 rounded-full bg-slate-700" />

            <span>
              {messages.length}{" "}
              {messages.length === 1
                ? "message"
                : "messages"}
            </span>

            {attachmentCount > 0 && (
              <>
                <span className="h-1 w-1 rounded-full bg-slate-700" />

                <span>
                  {attachmentCount}{" "}
                  {attachmentCount === 1
                    ? "file"
                    : "files"}
                </span>
              </>
            )}
          </div>

          {search.trim() && (
            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 font-semibold text-cyan-300">
              {filteredMessages.length}{" "}
              {filteredMessages.length === 1
                ? "match"
                : "matches"}
            </span>
          )}
        </div>
      </div>

      {/* AI summary */}
      {summaryVisible && (
        <section className="relative z-20 mx-4 mt-4 shrink-0 overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-sky-500/5 to-indigo-500/10 shadow-lg shadow-cyan-500/5">
          <div className="flex items-center justify-between gap-4 border-b border-white/5 px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                <Sparkles size={18} />
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-white">
                  AI Conversation Summary
                </h3>

                <p className="mt-0.5 text-xs text-slate-400">
                  {loadingSummary
                    ? "Analyzing the conversation..."
                    : "A concise view of the discussion and next steps"}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {!loadingSummary &&
                summary && (
                  <>
                    <button
                      type="button"
                      onClick={copySummary}
                      title="Copy summary"
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300"
                    >
                      {summaryCopied ? (
                        <Check size={16} />
                      ) : (
                        <Clipboard size={16} />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={refreshSummary}
                      title="Regenerate summary"
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300"
                    >
                      <RefreshCw
                        size={16}
                      />
                    </button>
                  </>
                )}

              <button
                type="button"
                onClick={() =>
                  setSummaryVisible(false)
                }
                title="Close summary"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto px-5 py-4">
            {loadingSummary ? (
              <div className="space-y-3">
                {[0, 1, 2].map(
                  (item) => (
                    <div
                      key={item}
                      className="animate-pulse rounded-2xl border border-white/5 bg-white/[0.03] p-4"
                    >
                      <div className="h-3 w-32 rounded bg-white/10" />
                      <div className="mt-3 h-3 w-full rounded bg-white/5" />
                      <div className="mt-2 h-3 w-4/5 rounded bg-white/5" />
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {summaryLines.map(
                  (line, index) => {
                    const cleanLine =
                      line.replace(
                        /^[-*•]\s*/,
                        ""
                      );

                    const labelMatch =
                      cleanLine.match(
                        /^\*\*(.+?)\*\*\s*:?\s*(.*)$/
                      );

                    const label =
                      labelMatch?.[1] ||
                      "";
                    const content =
                      labelMatch?.[2] ||
                      cleanLine;

                    return (
                      <div
                        key={`${index}-${line}`}
                        className="rounded-2xl border border-white/5 bg-[#0B1220]/40 px-4 py-3"
                      >
                        <div className="flex gap-3">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,.65)]" />

                          <p className="text-sm leading-6 text-slate-300">
                            {label && (
                              <span className="font-bold text-cyan-300">
                                {label}
                                {content
                                  ? ": "
                                  : ""}
                              </span>
                            )}

                            {content}
                          </p>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Search */}
      <div className="relative z-20 shrink-0 border-b border-white/5 bg-[#111827]/40 px-5 py-3 backdrop-blur">
        <ChatSearch
          search={search}
          setSearch={setSearch}
        />
      </div>

      {/* Conversation body */}
      <div
        ref={messagesContainerRef}
        className="relative min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,#152238_0%,#0B1220_62%)] px-5 py-6"
      >
        {loadingMessages ? (
          <div className="flex min-h-full items-center justify-center">
            <div className="w-full max-w-xl space-y-4">
              {[false, true, true].map(
                (mine, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      mine
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`animate-pulse rounded-3xl border border-white/5 bg-white/[0.04] ${
                        mine
                          ? "h-20 w-2/3"
                          : "h-16 w-1/2"
                      }`}
                    />
                  </div>
                )
              )}
            </div>
          </div>
        ) : loadError ? (
          <div className="flex min-h-full items-center justify-center">
            <div className="max-w-md rounded-3xl border border-red-500/15 bg-red-500/5 p-6 text-center">
              <h3 className="text-base font-bold text-white">
                Conversation couldn't be loaded
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {loadError}
              </p>

              <button
                type="button"
                onClick={fetchMessages}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15"
              >
                <RefreshCw size={15} />
                Try again
              </button>
            </div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex min-h-full items-center justify-center">
            <div className="max-w-sm text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/15 bg-cyan-500/10 text-cyan-300">
                <FileText size={25} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-white">
                {search.trim()
                  ? "No matching messages"
                  : "Start the conversation"}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {search.trim()
                  ? "Try a different keyword or search for an attachment name."
                  : `Send a message to ${receiver.name || "this developer"} and start collaborating.`}
              </p>
            </div>
          </div>
        ) : (
          <>
            <MessageList
              messages={filteredMessages}
              currentUser={currentUser}
              bottomRef={bottomRef}
              setReplyingTo={setReplyingTo}
              search={search}
              onEdit={handleEditMessage}
              onDelete={handleDeleteMessage}
              onReact={handleReactMessage}
            />

            <TypingIndicator
              typing={typing}
              receiverName={
                receiver?.name ||
                "Developer"
              }
            />
          </>
        )}

        {showJumpToLatest && (
          <button
            type="button"
            onClick={() =>
              scrollToLatest()
            }
            className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-cyan-400/20 bg-[#111827]/95 px-4 py-2.5 text-xs font-bold text-cyan-300 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl transition hover:border-cyan-400/40 hover:bg-[#172033]"
          >
            <ArrowDown size={14} />

            {newMessagesWhileAway > 0
              ? `${newMessagesWhileAway} new ${
                  newMessagesWhileAway ===
                  1
                    ? "message"
                    : "messages"
                }`
              : "Jump to latest"}
          </button>
        )}
      </div>

      {/* Action / upload status */}
      {(actionError || uploading) && (
        <div className="shrink-0 border-t border-white/10 bg-[#111827]/90 px-5 py-3 backdrop-blur-xl">
          {actionError && (
            <div className="mb-3 flex items-start justify-between gap-3 rounded-2xl border border-red-500/15 bg-red-500/5 px-4 py-3">
              <p className="text-xs leading-5 text-red-300">
                {actionError}
              </p>

              <button
                type="button"
                onClick={() =>
                  setActionError("")
                }
                className="shrink-0 text-red-300/70 transition hover:text-red-200"
                title="Dismiss"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {uploading && (
            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-400">
                  Uploading attachment
                </span>

                <span className="font-bold text-cyan-300">
                  {uploadProgress}%
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 transition-all duration-300"
                  style={{
                    width: `${uploadProgress}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Composer */}
      <div className="sticky bottom-0 z-30 shrink-0 border-t border-white/10 bg-[#111827]/95 p-4 backdrop-blur-xl sm:p-5">
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
