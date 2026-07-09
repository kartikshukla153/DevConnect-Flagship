import { useState } from "react";

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
    <div className="h-screen bg-[#070A12] text-white flex">

      <div className="w-[350px] border-r border-gray-800 flex flex-col">

        <ConversationList
          key={refreshKey}
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
        />

        <div className="border-t border-gray-800 p-4 overflow-y-auto">

          <SuggestedDevelopers
            onConversationCreated={handleConversationCreated}
          />

        </div>

      </div>

      <div className="flex-1">

        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 text-xl">
            Select a conversation or start a new one
          </div>
        )}

      </div>

    </div>
  );
}

export default Messages;