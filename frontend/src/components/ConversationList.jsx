import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  MessageSquare,
  Sparkles,
} from "lucide-react";

import OnlineIndicator from "./OnlineIndicator";
import useOnlineUsers from "../hooks/useOnlineUsers";

function ConversationList({
  selectedConversation,
  setSelectedConversation,
}) {
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState("");

  const onlineUsers = useOnlineUsers();

  const token = localStorage.getItem("token");

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const currentUserId = currentUser.id;

  const fetchConversations = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/conversations",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setConversations(res.data.conversations || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const filtered = useMemo(() => {
    return conversations.filter((conversation) => {
      const otherUser =
        conversation.participants.find(
          (u) => u._id !== currentUserId
        );

      if (!otherUser) return false;

      return (
        otherUser.name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        otherUser.email
          ?.toLowerCase()
          .includes(search.toLowerCase())
      );
    });
  }, [conversations, search]);

  const formatTime = (date) => {
    if (!date) return "";

    const d = new Date(date);

    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-b from-[#131c2d] to-[#0B1220]">

      {/* HEADER */}

      <div className="border-b border-white/10 p-6">

        <div className="flex items-center justify-between">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500 text-black shadow-lg shadow-cyan-500/20">

                <MessageSquare size={22} />

              </div>

              <div>

                <h2 className="text-2xl font-bold text-white">
                  Messages
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {filtered.length} Active Conversations
                </p>

              </div>

            </div>

          </div>

          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2">

            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-300">

              <Sparkles size={14} />

              Live

            </div>

          </div>

        </div>

        <div className="relative mt-6">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search developer..."
            className="w-full rounded-2xl border border-white/10 bg-[#0F172A]/80 py-3 pl-12 pr-4 text-white outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10"
          />

        </div>

      </div>

      {/* CONVERSATIONS */}

      <div className="flex-1 overflow-y-auto">

        {filtered.length === 0 && (

          <div className="flex h-full flex-col items-center justify-center px-8 text-center">

            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500/10">

              <MessageSquare
                size={36}
                className="text-cyan-400"
              />

            </div>

            <h3 className="mt-6 text-xl font-bold text-white">
              No Conversations
            </h3>

            <p className="mt-3 max-w-xs leading-7 text-slate-400">
              Start chatting with developers from the
              suggested panel to build your network.
            </p>

          </div>

        )}

        {filtered.map((conversation) => {

          const otherUser =
            conversation.participants.find(
              (u) => u._id !== currentUserId
            );

          if (!otherUser) return null;

          const isOnline =
            onlineUsers.includes(otherUser._id);

          const active =
            selectedConversation?._id ===
            conversation._id;
                      return (

            <button
              key={conversation._id}
              onClick={() =>
                setSelectedConversation(
                  conversation
                )
              }
              className={`group relative w-full overflow-hidden border-b border-white/5 px-5 py-4 text-left transition-all duration-300 ${
                active
                  ? "bg-gradient-to-r from-cyan-500/15 via-cyan-500/5 to-transparent"
                  : "hover:bg-white/5"
              }`}
            >

              {active && (
                <div className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-cyan-400" />
              )}

              <div className="flex items-center gap-4">

                {/* Avatar */}

                <div className="relative shrink-0">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-500 text-lg font-bold text-black shadow-lg shadow-cyan-500/20 transition-transform duration-300 group-hover:scale-105">

                    {otherUser.name
                      ?.charAt(0)
                      .toUpperCase()}

                  </div>

                  <div className="absolute -bottom-1 -right-1">

                    <OnlineIndicator
                      online={isOnline}
                    />

                  </div>

                </div>

                {/* Content */}

                <div className="min-w-0 flex-1">

                  <div className="flex items-center justify-between gap-3">

                    <h3 className="truncate text-[15px] font-semibold text-white">

                      {otherUser.name}

                    </h3>

                    <span className="shrink-0 text-xs text-slate-500">

                      {formatTime(
                        conversation.updatedAt
                      )}

                    </span>

                  </div>

                  <p className="mt-1 truncate text-sm text-slate-400">

                    {conversation.lastMessage?.content ||
                      otherUser.email}

                  </p>

                  <div className="mt-3 flex items-center gap-2">

                    <span
                      className={`h-2 w-2 rounded-full ${
                        isOnline
                          ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]"
                          : "bg-slate-600"
                      }`}
                    />

                    <span
                      className={`text-xs ${
                        isOnline
                          ? "text-emerald-400"
                          : "text-slate-500"
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

        })}
      </div>
          </div>
  );
}

export default ConversationList;