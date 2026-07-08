import { useState } from "react";

import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";

function Messages() {
  const [selectedConversation, setSelectedConversation] =
    useState(null);

  return (
    <div className="h-screen bg-[#070A12] text-white flex">

      <div className="w-[350px]">
        <ConversationList
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
        />
      </div>

      <div className="flex-1">

        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 text-xl">
            Select a conversation
          </div>
        )}

      </div>

    </div>
  );
}

export default Messages;