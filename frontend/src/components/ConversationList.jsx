import { useEffect, useState } from "react";
import axios from "axios";

import OnlineIndicator from "./OnlineIndicator";
import useOnlineUsers from "../hooks/useOnlineUsers";

function ConversationList({
  selectedConversation,
  setSelectedConversation,
}) {
  const [conversations, setConversations] = useState([]);

  const onlineUsers = useOnlineUsers();

  const token = localStorage.getItem("token");

  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );

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

      setConversations(res.data.conversations);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  return (
    <div className="h-full bg-[#0f172a] border-r border-gray-700 overflow-y-auto">

      <div className="p-4 border-b border-gray-700">

        <h2 className="text-xl font-bold text-cyan-400">
          Messages
        </h2>

      </div>

      {conversations.map((conversation) => {

        const otherUser =
          conversation.participants.find(
            (u) => u._id !== currentUser._id
          );

        const isOnline =
          onlineUsers.includes(otherUser._id);

        return (
          <div
            key={conversation._id}
            onClick={() =>
              setSelectedConversation(conversation)
            }
            className={`p-4 cursor-pointer border-b border-gray-800 hover:bg-gray-800 ${
              selectedConversation?._id ===
              conversation._id
                ? "bg-cyan-700"
                : ""
            }`}
          >

            <div className="flex items-center gap-3">

              <OnlineIndicator online={isOnline} />

              <div>

                <h3 className="font-semibold">
                  {otherUser.name}
                </h3>

                <p className="text-xs text-gray-400">
                  {otherUser.email}
                </p>

              </div>

            </div>

          </div>
        );
      })}
    </div>
  );
}

export default ConversationList;