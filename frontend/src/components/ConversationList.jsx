import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import {
  CheckCheck,
  MessageSquare,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import OnlineIndicator from "./OnlineIndicator";
import useOnlineUsers from "../hooks/useOnlineUsers";
import { getSocket } from "../socket/socket";

const API = "http://localhost:5000/api";

function getUserId(user) {
  return user?.id || user?._id || null;
}

function getId(value) {
  if (!value) return null;

  return typeof value === "string"
    ? value
    : value?._id || null;
}

function formatTime(date) {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const now = new Date();
  const sameDay =
    parsed.toDateString() ===
    now.toDateString();

  if (sameDay) {
    return parsed.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const diff =
    now.getTime() - parsed.getTime();

  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return parsed.toLocaleDateString([], {
      weekday: "short",
    });
  }

  return parsed.toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
}

function ConversationList({
  selectedConversation,
  setSelectedConversation,
}) {
  const [conversations, setConversations] =
    useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState("all");
  const [loading, setLoading] =
    useState(true);

  const onlineUsers = useOnlineUsers();

  const token = localStorage.getItem("token");

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const currentUserId =
    getUserId(currentUser);

  const fetchConversations =
    useCallback(async () => {
      if (!token) {
        setConversations([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const res = await axios.get(
          `${API}/conversations`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setConversations(
          res.data?.conversations || []
        );
      } catch (error) {
        console.error(
          "FETCH CONVERSATIONS ERROR:",
          error.response?.data ||
            error.message
        );
      } finally {
        setLoading(false);
      }
    }, [token]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    const socket = getSocket();

    if (!socket) return;

    const handleNewMessage = (
      message
    ) => {
      const conversationId = getId(
        message?.conversation
      );

      if (!conversationId) return;

      const senderId = getId(
        message?.sender
      );

      if (
        currentUserId &&
        senderId &&
        String(senderId) ===
          String(currentUserId)
      ) {
        return;
      }

      setConversations((prev) => {
        const existing = prev.find(
          (conversation) =>
            String(conversation._id) ===
            String(conversationId)
        );

        if (!existing) {
          fetchConversations();
          return prev;
        }

        const isOpen =
          String(
            selectedConversation?._id
          ) ===
          String(conversationId);

        const updated = {
          ...existing,
          lastMessageText:
            message?.deleted
              ? "This message was deleted"
              : message?.text ||
                existing.lastMessageText ||
                "",
          lastMessageSender:
            message?.sender ||
            existing.lastMessageSender,
          lastMessageAt:
            message?.createdAt ||
            new Date().toISOString(),
          lastMessage: message,
          unreadCount: isOpen
            ? 0
            : Number(
                existing.unreadCount || 0
              ) + 1,
        };

        return [
          updated,
          ...prev.filter(
            (conversation) =>
              String(conversation._id) !==
              String(conversationId)
          ),
        ];
      });
    };

    const handleMessagesSeen = ({
      conversationId,
      userId,
    }) => {
      if (
        userId &&
        currentUserId &&
        String(userId) !==
          String(currentUserId)
      ) {
        return;
      }

      if (!conversationId) return;

      setConversations((prev) =>
        prev.map((conversation) =>
          String(conversation._id) ===
          String(conversationId)
            ? {
                ...conversation,
                unreadCount: 0,
              }
            : conversation
        )
      );
    };

    const handleMessageUpdated = (
      updatedMessage
    ) => {
      const conversationId =
        getId(
          updatedMessage?.conversation
        );

      if (!conversationId) return;

      setConversations((prev) =>
        prev.map((conversation) =>
          String(conversation._id) ===
          String(conversationId)
            ? {
                ...conversation,
                lastMessageText:
                  updatedMessage?.text ||
                  conversation.lastMessageText ||
                  "",
                lastMessage:
                  updatedMessage,
              }
            : conversation
        )
      );
    };

    const handleMessageDeleted = (
      deletedMessage
    ) => {
      const conversationId =
        getId(
          deletedMessage?.conversation
        );

      if (!conversationId) return;

      setConversations((prev) =>
        prev.map((conversation) =>
          String(conversation._id) ===
          String(conversationId)
            ? {
                ...conversation,
                lastMessageText:
                  "This message was deleted",
                lastMessage:
                  deletedMessage,
              }
            : conversation
        )
      );
    };

    socket.on(
      "newMessage",
      handleNewMessage
    );

    socket.on(
      "messagesSeen",
      handleMessagesSeen
    );

    socket.on(
      "messageUpdated",
      handleMessageUpdated
    );

    socket.on(
      "messageDeleted",
      handleMessageDeleted
    );

    return () => {
      socket.off(
        "newMessage",
        handleNewMessage
      );

      socket.off(
        "messagesSeen",
        handleMessagesSeen
      );

      socket.off(
        "messageUpdated",
        handleMessageUpdated
      );

      socket.off(
        "messageDeleted",
        handleMessageDeleted
      );
    };
  }, [
    currentUserId,
    fetchConversations,
    selectedConversation?._id,
  ]);

  useEffect(() => {
    const handleRead = () => {
      fetchConversations();
    };

    window.addEventListener(
      "devconnect:messages-read",
      handleRead
    );

    return () => {
      window.removeEventListener(
        "devconnect:messages-read",
        handleRead
      );
    };
  }, [fetchConversations]);

  useEffect(() => {
    if (!selectedConversation?._id) {
      return;
    }

    setConversations((prev) =>
      prev.map((conversation) =>
        String(conversation._id) ===
        String(selectedConversation._id)
          ? {
              ...conversation,
              unreadCount: 0,
            }
          : conversation
      )
    );
  }, [selectedConversation?._id]);

  const unreadTotal = useMemo(
    () =>
      conversations.reduce(
        (total, conversation) =>
          total +
          Number(
            conversation.unreadCount || 0
          ),
        0
      ),
    [conversations]
  );

  const filtered = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return conversations.filter(
      (conversation) => {
        const otherUser =
          conversation.participants?.find(
            (user) =>
              String(user?._id) !==
              String(currentUserId)
          );

        if (!otherUser) return false;

        const unread =
          Number(
            conversation.unreadCount || 0
          ) > 0;

        if (
          filter === "unread" &&
          !unread
        ) {
          return false;
        }

        if (!query) return true;

        const name =
          otherUser.name
            ?.toLowerCase() || "";

        const email =
          otherUser.email
            ?.toLowerCase() || "";

        const preview =
          conversation.lastMessageText
            ?.toLowerCase() || "";

        return (
          name.includes(query) ||
          email.includes(query) ||
          preview.includes(query)
        );
      }
    );
  }, [
    conversations,
    currentUserId,
    filter,
    search,
  ]);

  const getOtherUser = (
    conversation
  ) =>
    conversation.participants?.find(
      (user) =>
        String(user?._id) !==
        String(currentUserId)
    );

  const getPreview = (
    conversation,
    otherUser
  ) => {
    const preview =
      conversation.lastMessageText?.trim();

    if (!preview) {
      return "No messages yet";
    }

    const senderId = getId(
      conversation.lastMessageSender
    );

    if (
      senderId &&
      currentUserId &&
      String(senderId) ===
        String(currentUserId)
    ) {
      return `You: ${preview}`;
    }

    return preview;
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-b from-[#131c2d] to-[#0B1220] shadow-2xl shadow-cyan-500/[0.03]">
      {/* Header */}
      <div className="shrink-0 border-b border-white/10 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500 text-black shadow-lg shadow-cyan-500/20">
              <MessageSquare size={22} />

              {unreadTotal > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#131c2d] bg-cyan-400 px-1 text-[9px] font-black text-slate-950">
                  {unreadTotal > 99
                    ? "99+"
                    : unreadTotal}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-2xl font-bold tracking-tight text-white">
                Messages
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {conversations.length}{" "}
                {conversations.length ===
                1
                  ? "conversation"
                  : "conversations"}
                {unreadTotal > 0 && (
                  <>
                    {" "}
                    ·{" "}
                    <span className="font-semibold text-cyan-300">
                      {unreadTotal} unread
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="shrink-0 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
              <Sparkles size={13} />
              Live
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-5">
          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search people or messages..."
            className="w-full rounded-2xl border border-white/10 bg-[#0F172A]/80 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cyan-400/60 focus:bg-[#0F172A] focus:ring-4 focus:ring-cyan-500/10 placeholder:text-slate-600"
          />
        </div>

        {/* Filters */}
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setFilter("all")
            }
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
              filter === "all"
                ? "border border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                : "border border-transparent text-slate-500 hover:bg-white/5 hover:text-slate-300"
            }`}
          >
            <SlidersHorizontal
              size={13}
            />
            All
          </button>

          <button
            type="button"
            onClick={() =>
              setFilter("unread")
            }
            className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
              filter === "unread"
                ? "border border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                : "border border-transparent text-slate-500 hover:bg-white/5 hover:text-slate-300"
            }`}
          >
            Unread
            {unreadTotal > 0 && (
              <span className="ml-1.5 rounded-full bg-cyan-400/15 px-1.5 py-0.5 text-[9px] text-cyan-300">
                {unreadTotal}
              </span>
            )}
          </button>

          {(search.trim() ||
            filter !== "all") && (
            <span className="ml-auto text-[10px] font-medium text-slate-600">
              {filtered.length} shown
            </span>
          )}
        </div>
      </div>

      {/* List */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-1 p-3">
            {[1, 2, 3, 4, 5].map(
              (item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-2xl border border-white/5 bg-white/[0.02] p-4"
                >
                  <div className="flex gap-3">
                    <div className="h-12 w-12 shrink-0 rounded-2xl bg-white/5" />

                    <div className="min-w-0 flex-1">
                      <div className="h-3 w-28 rounded bg-white/10" />
                      <div className="mt-3 h-3 w-40 rounded bg-white/5" />
                      <div className="mt-3 h-2 w-16 rounded bg-white/5" />
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center px-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/15 bg-cyan-500/10">
              <MessageSquare
                size={27}
                className="text-cyan-400"
              />
            </div>

            <h3 className="mt-5 text-lg font-bold text-white">
              {search.trim()
                ? "No matching conversations"
                : filter === "unread"
                ? "You're all caught up"
                : "No conversations yet"}
            </h3>

            <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
              {search.trim()
                ? "Try another developer name, email, or message."
                : filter === "unread"
                ? "There are no unread messages right now."
                : "Start a conversation from the Developers directory."}
            </p>

            {(search.trim() ||
              filter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
                className="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="p-2">
            {filtered.map(
              (conversation) => {
                const otherUser =
                  getOtherUser(
                    conversation
                  );

                if (!otherUser) {
                  return null;
                }

                const isOnline =
                  onlineUsers.some(
                    (id) =>
                      String(id) ===
                      String(
                        otherUser._id
                      )
                  );

                const active =
                  String(
                    selectedConversation?._id
                  ) ===
                  String(
                    conversation._id
                  );

                const unreadCount =
                  Number(
                    conversation.unreadCount ||
                      0
                  );

                const preview =
                  getPreview(
                    conversation,
                    otherUser
                  );

                return (
                  <button
                    key={
                      conversation._id
                    }
                    type="button"
                    onClick={() => {
                      setSelectedConversation(
                        conversation
                      );

                      setConversations(
                        (prev) =>
                          prev.map(
                            (item) =>
                              String(
                                item._id
                              ) ===
                              String(
                                conversation._id
                              )
                                ? {
                                    ...item,
                                    unreadCount: 0,
                                  }
                                : item
                          )
                      );
                    }}
                    className={`group relative mb-1 w-full overflow-hidden rounded-2xl border px-3 py-3 text-left transition-all duration-200 ${
                      active
                        ? "border-cyan-400/15 bg-cyan-400/[0.08] shadow-lg shadow-cyan-500/[0.04]"
                        : "border-transparent hover:border-white/5 hover:bg-white/[0.035]"
                    }`}
                  >
                    {active && (
                      <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,.7)]" />
                    )}

                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {otherUser.profilePicture ? (
                          <img
                            src={
                              otherUser.profilePicture
                            }
                            alt={
                              otherUser.name ||
                              "Developer"
                            }
                            className={`h-12 w-12 rounded-2xl object-cover ${
                              active
                                ? "ring-2 ring-cyan-400/20"
                                : ""
                            }`}
                          />
                        ) : (
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-500 text-base font-black text-slate-950 ${
                              active
                                ? "shadow-lg shadow-cyan-500/20"
                                : ""
                            }`}
                          >
                            {otherUser.name
                              ?.charAt(
                                0
                              )
                              .toUpperCase() ||
                              "?"}
                          </div>
                        )}

                        <div className="absolute -bottom-1 -right-1">
                          <OnlineIndicator
                            online={
                              isOnline
                            }
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3
                            className={`min-w-0 flex-1 truncate text-[13px] ${
                              unreadCount >
                              0
                                ? "font-bold text-white"
                                : "font-semibold text-slate-200"
                            }`}
                          >
                            {otherUser.name ||
                              "Developer"}
                          </h3>

                          <span
                            className={`shrink-0 text-[10px] ${
                              unreadCount >
                              0
                                ? "font-semibold text-cyan-300"
                                : "text-slate-600"
                            }`}
                          >
                            {formatTime(
                              conversation.lastMessageAt ||
                                conversation.updatedAt
                            )}
                          </span>
                        </div>

                        <div className="mt-1 flex items-center gap-2">
                          <p
                            className={`min-w-0 flex-1 truncate text-xs ${
                              unreadCount >
                              0
                                ? "font-medium text-slate-200"
                                : "text-slate-500"
                            }`}
                          >
                            {preview}
                          </p>

                          {unreadCount >
                            0 && (
                            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400 px-1.5 text-[9px] font-black text-slate-950 shadow-lg shadow-cyan-400/10">
                              {unreadCount >
                              99
                                ? "99+"
                                : unreadCount}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex items-center gap-1.5">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isOnline
                                ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.8)]"
                                : "bg-slate-700"
                            }`}
                          />

                          <span
                            className={`text-[9px] font-medium ${
                              isOnline
                                ? "text-emerald-400"
                                : "text-slate-600"
                            }`}
                          >
                            {isOnline
                              ? "Online"
                              : "Offline"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-white/5 px-4 py-3">
        <div className="flex items-center justify-between text-[10px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <CheckCheck
              size={12}
              className="text-cyan-500/70"
            />
            Real-time messaging
          </div>

          <span>
            {filtered.length} visible
          </span>
        </div>
      </div>
    </div>
  );
}

export default ConversationList;
