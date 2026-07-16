import { useState } from "react";

import AppLayout from "../layout/AppLayout";

import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";
import SuggestedDevelopers from "../components/chat/SuggestedDevelopers";

function Messages() {
  const [selectedConversation, setSelectedConversation] =
    useState(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const handleConversationCreated = (conversation) => {
    setSelectedConversation(conversation);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <AppLayout>
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-150px)]">

        {/* LEFT SIDEBAR */}

        <div className="col-span-3">

          <ConversationList
            key={refreshKey}
            selectedConversation={selectedConversation}
            setSelectedConversation={setSelectedConversation}
          />

        </div>

        {/* CHAT */}

        <div className="col-span-6">

          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
            />
          ) : (
            <div className="h-full rounded-3xl border border-[#263243] bg-[#111827] flex items-center justify-center">

              <div className="text-center">

                <h2 className="text-3xl font-bold mb-4">
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

        {/* RIGHT PANEL */}

        <div className="col-span-3">

          <div className="rounded-3xl border border-[#263243] bg-[#111827] h-full p-6 overflow-y-auto">

            <h2 className="text-xl font-semibold mb-6">
              Suggested Developers
            </h2>

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