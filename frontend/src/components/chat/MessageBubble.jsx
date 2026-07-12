import { useState } from "react";
import axios from "axios";
import MessageActionMenu from "./MessageActionMenu";
import { getSocket } from "../../socket/socket";
function MessageBubble({
  message,
  isMine,
  onReply,
  search,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const seen =
    isMine &&
    message.readBy &&
    message.readBy.length > 1;

  const attachment = message.attachment;

  const token = localStorage.getItem("token");

  const reactHeart = async () => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/messages/reaction/${message._id}`,
        {
          emoji: "❤️",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const socket = getSocket();

socket?.emit("messageReactionUpdated", res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const highlightText = (text) => {
    if (!search) return text;

    const regex = new RegExp(`(${search})`, "gi");

    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-yellow-300 text-black rounded px-1"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const createdDate = new Date(message.createdAt);

  const time = createdDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const fullDate = createdDate.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      onDoubleClick={reactHeart}
      className={`group relative flex ${
        isMine ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`relative max-w-[70%] lg:max-w-[60%] rounded-2xl px-4 py-3 shadow-lg transition ${
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
          <p className="whitespace-pre-wrap break-words">
            {highlightText(message.text)}
          </p>
        )}

        {/* ATTACHMENTS */}
        {attachment?.url && (
          <div className="mt-3">

            {/* IMAGE */}
            {attachment.mimeType?.startsWith("image/") && (
              <img
                src={attachment.url}
                alt="attachment"
                className="rounded-xl max-h-80 border border-gray-700 cursor-pointer hover:scale-[1.02] transition duration-200"
              />
            )}

            {/* PDF */}
            {attachment.mimeType ===
              "application/pdf" && (
              <a
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-gray-700 bg-black/20 px-4 py-3 hover:bg-black/30 hover:border-cyan-400 transition-all"
              >
                <span className="text-2xl">
                  📄
                </span>

                <div className="flex flex-col">
                  <span className="font-medium">
                    {attachment.originalName}
                  </span>

                  <span className="text-xs opacity-70">
                    PDF Document
                  </span>
                </div>
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
              <audio
  controls
  preload="metadata"
  className="w-72 max-w-full"
>
                <source
                  src={attachment.url}
                  type={attachment.mimeType}
                />
              </audio>
            )}

            {/* OTHER FILES */}
            {!attachment.mimeType?.startsWith(
              "image/"
            ) &&
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
                  className="flex items-center gap-3 rounded-xl bg-black/20 px-4 py-3 hover:bg-black/30 transition"
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
        <div className="mt-3 flex items-center justify-between text-[11px] opacity-75">

          <div className="flex gap-2 items-center">

            <span className="opacity-60">
              {fullDate}
            </span>

            <span>
              {time}
            </span>

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
                  ? "text-blue-800 font-semibold"
                  : ""
              }
            >
              {seen ? "✓✓" : "✓"}
            </span>
          )}
        </div>

        {/* Menu */}
        <button
          title="Message options"
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