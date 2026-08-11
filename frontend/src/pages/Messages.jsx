import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

import AppLayout from "../layout/AppLayout";
import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";
import SuggestedDevelopers from "../components/chat/SuggestedDevelopers";

const API = "http://localhost:5000/api";

function Messages() {
  const [selectedConversation, setSelectedConversation] =
    useState(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const [openingConversation, setOpeningConversation] =
    useState(false);

  const [searchParams] = useSearchParams();

  const userId = searchParams.get("userId");

  const token = localStorage.getItem("token");

  /*
   * When Messages is opened with:
   *
   * /messages?userId=XXXXXXXX
   *
   * automatically create/find the conversation
   * and open it.
   */
  useEffect(() => {
    if (!userId) return;

    const openConversation = async () => {
      try {
        setOpeningConversation(true);

        const response = await axios.post(
          `${API}/conversations/${userId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const conversation =
          response.data?.conversation;

        if (conversation) {
          setSelectedConversation(conversation);
          setRefreshKey((prev) => prev + 1);
        }
      } catch (error) {
        console.error(
          "OPEN CONVERSATION ERROR:",
          error.response?.data || error.message
        );
      } finally {
        setOpeningConversation(false);
      }
    };

    openConversation();
  }, [userId, token]);

  const handleConversationCreated = (conversation) => {
    setSelectedConversation(conversation);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <AppLayout>
      <div className="grid h-[calc(100vh-150px)] grid-cols-12 gap-6">

        {/* LEFT — CONVERSATIONS */}
        <div className="col-span-3">
          <ConversationList
            key={refreshKey}
            selectedConversation={selectedConversation}
            setSelectedConversation={setSelectedConversation}
          />
        </div>

        {/* CENTER — CHAT */}
        <div className="col-span-6">

          {openingConversation ? (
            <div className="flex h-full items-center justify-center rounded-3xl border border-[#263243] bg-[#111827]">
              <div className="text-center">
                <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />

                <h2 className="text-xl font-semibold text-white">
                  Opening conversation...
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  Connecting you with the developer.
                </p>
              </div>
            </div>
          ) : selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-3xl border border-[#263243] bg-[#111827]">
              <div className="text-center">
                <h2 className="mb-4 text-3xl font-bold text-white">
                  Welcome to Messages
                </h2>

                <p className="text-gray-400">
                  Select a conversation or start chatting
                  with another developer.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT — SUGGESTED DEVELOPERS */}
        <div className="col-span-3">
          <div className="h-full overflow-y-auto rounded-3xl border border-[#263243] bg-[#111827] p-6">

            <SuggestedDevelopers
              onConversationCreated={
                handleConversationCreated
              }
            />

          </div>
        </div>

      </div>
    </AppLayout>
  );
}

export default Messages;