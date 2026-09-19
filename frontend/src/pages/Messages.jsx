import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";
import SuggestedDevelopers from "../components/chat/SuggestedDevelopers";

const API =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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

  const getCurrentUserId = useCallback(() => {
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
  }, [token]);

  useEffect(() => {
    if (!userId || !token) return;

    const currentUserId = getCurrentUserId();

    if (
      currentUserId &&
      String(currentUserId) === String(userId)
    ) {
      setConversationError(
        "You cannot start a conversation with yourself."
      );
      setOpeningConversation(false);
      return;
    }

    let cancelled = false;

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

        if (cancelled) return;

        const conversation =
          response.data?.conversation;

        if (!conversation) {
          throw new Error(
            "Conversation was not returned by the server."
          );
        }

        setSelectedConversation(conversation);
        setRefreshKey((previous) => previous + 1);
      } catch (error) {
        if (cancelled) return;

        console.error(
          "OPEN CONVERSATION ERROR:",
          error.response?.data || error.message
        );

        setConversationError(
          error.response?.data?.message ||
            "Unable to open this conversation."
        );
      } finally {
        if (!cancelled) {
          setOpeningConversation(false);
        }
      }
    };

    openConversation();

    return () => {
      cancelled = true;
    };
  }, [userId, token, getCurrentUserId]);

  const handleConversationCreated = useCallback(
    (conversation) => {
      setConversationError("");
      setSelectedConversation(conversation);
      setRefreshKey((previous) => previous + 1);
    },
    []
  );

  const handleConversationSelected = useCallback(
    (conversation) => {
      setConversationError("");
      setSelectedConversation(conversation);
    },
    []
  );

  return (
    <div className="mx-auto h-[calc(100vh-150px)] max-w-[1600px]">
      <div className="grid h-full min-h-0 grid-cols-12 gap-5">
        {/* LEFT — CONVERSATIONS */}
        <div className="col-span-12 min-h-0 lg:col-span-3">
          <ConversationList
            key={refreshKey}
            selectedConversation={selectedConversation}
            setSelectedConversation={
              handleConversationSelected
            }
          />
        </div>

        {/* CENTER — CHAT */}
        <div className="col-span-12 min-h-0 lg:col-span-6">
          {openingConversation ? (
            <div className="flex h-full min-h-[500px] items-center justify-center rounded-[30px] border border-white/10 bg-gradient-to-b from-[#121A2A] to-[#0B1220]">
              <div className="px-6 text-center">
                <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />

                <h2 className="text-xl font-semibold text-white">
                  Opening conversation
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Connecting you with the developer.
                </p>
              </div>
            </div>
          ) : conversationError ? (
            <div className="flex h-full min-h-[500px] items-center justify-center rounded-[30px] border border-white/10 bg-gradient-to-b from-[#121A2A] to-[#0B1220]">
              <div className="max-w-md px-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/10">
                  <span className="text-xl">
                    !
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
                  className="mt-6 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-gray-200 transition hover:border-cyan-400/30 hover:bg-cyan-400/5 hover:text-cyan-300"
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
            <div className="relative flex h-full min-h-[500px] items-center justify-center overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-b from-[#121A2A] via-[#0F172A] to-[#0B1220]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08),transparent_45%)]" />

              <div className="relative max-w-lg px-6 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10 text-3xl shadow-[0_0_50px_rgba(34,211,238,0.08)]">
                  💬
                </div>

                <p className="mt-7 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                  Developer Communication
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
                  Start a conversation
                </h2>

                <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-400">
                  Select an existing conversation or choose a
                  developer from the network to start collaborating.
                </p>

                <div className="mt-7 flex flex-wrap justify-center gap-2">
                  {[
                    "Real-time chat",
                    "File sharing",
                    "AI summaries",
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — SUGGESTED DEVELOPERS */}
        <div className="col-span-12 min-h-0 lg:col-span-3">
          <div className="h-full min-h-[400px] overflow-y-auto rounded-[30px] border border-white/10 bg-gradient-to-b from-[#131c2d] to-[#0B1220] p-5">
            <SuggestedDevelopers
              onConversationCreated={
                handleConversationCreated
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messages;