import { useState } from "react";
import MessageActionMenu from "./MessageActionMenu";

function MessageBubble({
  message,
  isMine,
  onReply,
  onEdit,
  onDelete,
  onReact,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={`group relative flex mb-2 ${
        isMine ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`
          relative
          max-w-[72%]
          rounded-2xl
          px-4
          py-3
          shadow-lg
          transition-all
          ${
            message.deleted
              ? "bg-gray-700 text-gray-300 italic"
              : isMine
              ? "bg-cyan-500 text-black"
              : "bg-[#1F2937] text-white"
          }
        `}
      >
        {/* Reply Preview */}

        {message.replyTo && !message.deleted && (
          <div className="mb-2 border-l-2 border-cyan-400 pl-3 opacity-80">
            <p className="text-xs font-semibold">
              {message.replyTo.sender?.name}
            </p>

            <p className="text-xs truncate">
              {message.replyTo.text}
            </p>
          </div>
        )}

        {/* Message */}

        <p className="whitespace-pre-wrap break-words">
          {message.text}
        </p>

        {/* Reactions */}

        {!message.deleted &&
          message.reactions?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.reactions.map((reaction) => (
                <span
                  key={reaction.user}
                  className="
                    px-2
                    py-0.5
                    rounded-full
                    text-xs
                    bg-black/20
                    backdrop-blur
                  "
                >
                  {reaction.emoji}
                </span>
              ))}
            </div>
          )}

        {/* Footer */}

        <div className="flex items-center justify-end gap-2 mt-2">

          {message.edited && !message.deleted && (
            <span className="text-[10px] opacity-70 italic">
              edited
            </span>
          )}

          <span className="text-[10px] opacity-60">
            {new Date(
              message.createdAt
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

        </div>

        {/* Three Dots */}

        {!message.deleted && (
          <>
            <button
              onClick={() =>
                setMenuOpen((prev) => !prev)
              }
              className="
                absolute
                top-2
                right-2
                opacity-0
                group-hover:opacity-100
                transition
                text-sm
              "
            >
              ⋮
            </button>

            {menuOpen && (
              <MessageActionMenu
                isMine={isMine}
                onReply={() => {
                  onReply(message);
                  setMenuOpen(false);
                }}
                onEdit={() => {
                  onEdit(message);
                  setMenuOpen(false);
                }}
                onDelete={() => {
                  onDelete(message);
                  setMenuOpen(false);
                }}
                onReact={() => {
                  onReact(message);
                  setMenuOpen(false);
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;