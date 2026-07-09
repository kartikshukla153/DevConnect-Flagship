import OnlineIndicator from "../OnlineIndicator";
import formatLastSeen from "../../utils/formatLastSeen";

function ChatHeader({ receiver, isOnline }) {
  return (
    <div className="border-b border-gray-700 p-4 flex items-center gap-3">

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
  );
}

export default ChatHeader;