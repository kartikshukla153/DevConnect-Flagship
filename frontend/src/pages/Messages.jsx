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

  const [conversationError, setConversationError] =
    useState("");

  const [searchParams] = useSearchParams();

  const userId = searchParams.get("userId");

  const token = localStorage.getItem("token");

  /*
   * Get the currently authenticated user's ID
   *
   * Your JWT payload may use either:
   * - id
   * - _id
   * - userId
   *
   * We support all three so this component remains
   * compatible with the existing authentication flow.
   */
  const getCurrentUserId = () => {
    try {
      if (!token) return null;

      const payload = JSON.parse(
        atob(token.split(".")[1])
      );

      return (
        payload.id ||
        payload._id ||
        payload.userId ||
        null
      );
    } catch (error) {
      console.error(
        "Unable to decode authentication token:",
        error
      );

      return null;
    }
  };

  /*
   * When Messages is opened with:
   *
   * /messages?userId=XXXXXXXX
   *
   * automatically create/find the conversation
   * and open it.
   *
   * IMPORTANT:
   * We do NOT attempt to create a conversation
   * with the currently authenticated user.
   */
  useEffect(() => {
    if (!userId || !token) return;

    const currentUserId = getCurrentUserId();

    /*
     * Prevent self-conversation requests.
     *
     * Backend already rejects these requests, but
     * preventing them here gives the user a clean UI
     * instead of a 400 error in the browser console.
     */
    if (
      currentUserId &&
      String(currentUserId) === String(userId)
    ) {
      console.warn(
        "Conversation request ignored: target user is the current user."
      );

      setConversationError(
        "You cannot start a conversation with yourself."
      );

      setOpeningConversation(false);

      return;
    }

    const openConversation = async () => {
      try {
        setOpeningConversation(true);
        setConversationError("");

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

        setConversationError(
          error.response?.data?.message ||
            "Unable to open this conversation."
        );
      } finally {
        setOpeningConversation(false);
      }
    };

    openConversation();
  }, [userId, token]);

  const handleConversationCreated = (conversation) => {
    setConversationError("");
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
          ) : conversationError ? (
            <div className="flex h-full items-center justify-center rounded-3xl border border-[#263243] bg-[#111827]">
              <div className="max-w-md px-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <span className="text-2xl">
                    👤
                  </span>
                </div>

                <h2 className="mt-5 text-xl font-semibold text-white">
                  Conversation unavailable
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  {conversationError}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setConversationError("");
                    setSelectedConversation(null);
                  }}
                  className="mt-6 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-gray-200 transition hover:border-cyan-400/30 hover:text-cyan-300"
                >
                  Back to Messages
                </button>
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