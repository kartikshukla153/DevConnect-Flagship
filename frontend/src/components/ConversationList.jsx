import { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  MessageSquare,
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
    localStorage.getItem("user")
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

  const filtered = conversations.filter((conversation) => {
    const other = conversation.participants.find(
      (u) => u._id !== currentUserId
    );

    return other?.name
      ?.toLowerCase()
      .includes(search.toLowerCase());
  });

  return (
    <div className="h-full rounded-3xl bg-[#111827] border border-[#263243] overflow-hidden flex flex-col">

      {/* HEADER */}

      <div className="p-6 border-b border-[#263243]">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-2xl font-bold">
              Messages
            </h2>

            <p className="text-gray-400 text-sm mt-1">
              {conversations.length} Conversations
            </p>

          </div>

          <div className="w-11 h-11 rounded-xl bg-cyan-500 flex items-center justify-center">
            <MessageSquare
              size={20}
              className="text-black"
            />
          </div>

        </div>

        <div className="mt-5 relative">

          <Search
            size={18}
            className="absolute left-4 top-3.5 text-gray-500"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search developers..."
            className="w-full rounded-xl bg-[#0B1220] border border-[#374151] pl-11 pr-4 py-3 outline-none focus:border-cyan-400 transition"
          />

        </div>

      </div>

      {/* LIST */}

      <div className="flex-1 overflow-y-auto">

        {filtered.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-500 p-8 text-center">
            No conversations found.
          </div>
        )}

        {filtered.map((conversation) => {

          const otherUser =
            conversation.participants.find(
              (user) =>
                user._id !== currentUserId
            );

          if (!otherUser) return null;

          const isOnline =
            onlineUsers.includes(otherUser._id);

          return (
            <button
              key={conversation._id}
              onClick={() =>
                setSelectedConversation(
                  conversation
                )
              }
              className={`w-full text-left px-5 py-4 transition border-b border-[#1B2433]
              ${
                selectedConversation?._id ===
                conversation._id
                  ? "bg-cyan-500/10 border-l-4 border-l-cyan-400"
                  : "hover:bg-[#1A2332]"
              }`}
            >
              <div className="flex items-center gap-4">

                <div className="relative">

                  <div className="w-12 h-12 rounded-full bg-cyan-500 text-black flex items-center justify-center font-bold text-lg">
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

                <div className="flex-1 overflow-hidden">

                  <div className="flex justify-between items-center">

                    <h3 className="font-semibold truncate">
                      {otherUser.name}
                    </h3>

                    <span className="text-xs text-gray-500">
                      Now
                    </span>

                  </div>

                  <p className="text-sm text-gray-400 truncate mt-1">
                    {otherUser.email}
                  </p>

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