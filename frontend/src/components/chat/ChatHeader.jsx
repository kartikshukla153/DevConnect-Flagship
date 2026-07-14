import OnlineIndicator from "../OnlineIndicator";
import formatLastSeen from "../../utils/formatLastSeen";

function ChatHeader({
  receiver,
  isOnline,
  openSummary,
}) {
  return (
    <div className="border-b border-gray-700 p-4 flex items-center justify-between">

      <div className="flex items-center gap-3">

        <OnlineIndicator online={isOnline} />

        <div>
          <h2 className="font-bold text-lg">
            {receiver.name}
          </h2>

          <p className="text-sm text-gray-400">
            {isOnline
              ? "Online"
              : formatLastSeen(receiver.lastSeen)}
          </p>
        </div>

      </div>

      <button
        onClick={openSummary}
        className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-black hover:bg-cyan-400 transition"
      >
        ✨ Summarize Chat
      </button>

    </div>
  );
}

export default ChatHeader;