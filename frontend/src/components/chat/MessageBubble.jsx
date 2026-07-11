import { useState } from "react";
import MessageActionMenu from "./MessageActionMenu";

function MessageBubble({
  message,
  isMine,
  onReply,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const seen =
    isMine &&
    message.readBy &&
    message.readBy.length > 1;

  const attachment = message.attachment;

  return (
    <div
      className={`group relative flex ${
        isMine ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`relative max-w-[72%] rounded-2xl px-4 py-3 shadow-lg ${
          isMine
            ? "bg-cyan-500 text-black"
            : "bg-[#1F2937] text-white"
        }`}
      >
        {/* Reply */}
        {message.replyTo && (
          <div className="mb-2 border-l-2 border-cyan-400 pl-3 opacity-80">
            <p className="text-xs font-semibold">
              {message.replyTo.sender?.name}
            </p>

            <p className="text-xs truncate">
              {message.replyTo.text}
            </p>
          </div>
        )}

        {/* TEXT */}
        {message.text && (
          <p className="whitespace-pre-wrap mb-2">
            {message.text}
          </p>
        )}

        {/* ATTACHMENTS */}

        {attachment?.url && (
          <div className="mt-2">

            {/* IMAGE */}
            {attachment.mimeType?.startsWith("image/") && (
              <img
                src={attachment.url}
                alt="attachment"
                className="rounded-xl max-h-72"
              />
            )}

            {/* PDF */}
            {attachment.mimeType ===
              "application/pdf" && (
              <a
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg bg-black/10 p-3 hover:bg-black/20"
              >
                📄 {attachment.originalName}
              </a>
            )}

            {/* VIDEO */}
            {attachment.mimeType?.startsWith(
              "video/"
            ) && (
              <video
                controls
                className="rounded-xl max-h-72"
              >
                <source
                  src={attachment.url}
                  type={attachment.mimeType}
                />
              </video>
            )}

            {/* AUDIO */}
            {attachment.mimeType?.startsWith(
              "audio/"
            ) && (
              <audio controls>
                <source
                  src={attachment.url}
                  type={attachment.mimeType}
                />
              </audio>
            )}

            {/* OTHER FILES */}
            {!attachment.mimeType?.startsWith("image/") &&
              !attachment.mimeType?.startsWith(
                "video/"
              ) &&
              !attachment.mimeType?.startsWith(
                "audio/"
              ) &&
              attachment.mimeType !==
                "application/pdf" && (
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-lg bg-black/10 p-3 hover:bg-black/20"
                >
                  📎 {attachment.originalName}
                </a>
              )}
          </div>
        )}

        {/* Reactions */}
        {message.reactions?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {message.reactions.map((reaction) => (
              <span
                key={reaction.user}
                className="rounded-full bg-black/20 px-2 py-1 text-sm"
              >
                {reaction.emoji}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-2 flex items-center justify-between text-[10px] opacity-70">
          <div>
            {message.edited && (
              <span className="italic">
                edited
              </span>
            )}
          </div>

          {isMine && (
            <span
              className={
                seen
                  ? "text-blue-900 font-semibold"
                  : ""
              }
            >
              {seen ? "Seen ✓✓" : "✓"}
            </span>
          )}
        </div>

        {/* Menu */}
        <button
          onClick={() =>
            setMenuOpen(!menuOpen)
          }
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
        >
          ⋮
        </button>

        {menuOpen && (
          <MessageActionMenu
            message={message}
            isMine={isMine}
            onReply={() => {
              onReply(message);
              setMenuOpen(false);
            }}
            onClose={() =>
              setMenuOpen(false)
            }
          />
        )}
      </div>
    </div>
  );
}

export default MessageBubble;