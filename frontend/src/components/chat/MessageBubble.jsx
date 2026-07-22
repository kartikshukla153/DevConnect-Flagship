import { useState } from "react";
import axios from "axios";
import {
  Check,
  CheckCheck,
  Clock3,
  Download,
  File,
  FileText,
  Heart,
  Image as ImageIcon,
  MoreVertical,
  Music2,
  Play,
} from "lucide-react";

import MessageActionMenu from "./MessageActionMenu";
import { getSocket } from "../../socket/socket";

function MessageBubble({
  message,
  isMine,
  onReply,
  search,
}) {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const token =
    localStorage.getItem("token");

  const attachment =
    message.attachment;

  const seen =
    isMine &&
    message.readBy &&
    message.readBy.length > 1;

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

      getSocket()?.emit(
        "messageReactionUpdated",
        res.data.data
      );
    } catch (err) {
      console.log(err);
    }
  };

  const highlightText = (text) => {
    if (!search) return text;

    const regex = new RegExp(
      `(${search})`,
      "gi"
    );

    return text
      .split(regex)
      .map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="rounded bg-yellow-300 px-1 text-black"
          >
            {part}
          </mark>
        ) : (
          part
        )
      );
  };

  const createdDate = new Date(
    message.createdAt
  );

  const time =
    createdDate.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  const fullDate =
    createdDate.toLocaleDateString(
      [],
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );

  return (
    <div
      onDoubleClick={reactHeart}
      className={`group flex w-full ${
        isMine
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`relative max-w-[82%] lg:max-w-[68%] rounded-[26px] border shadow-xl transition-all duration-300 hover:shadow-cyan-500/10

        ${
          isMine
            ? "border-cyan-400/20 bg-gradient-to-br from-cyan-400 to-cyan-500 text-black"
            : "border-[#2B3648] bg-[#151E2C] text-white"
        }`}
      >
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-black/10 px-5 py-3">

          <div className="flex items-center gap-3">

            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full font-bold

              ${
                isMine
                  ? "bg-black/15"
                  : "bg-cyan-500 text-black"
              }`}
            >
              {message.sender?.name
                ?.charAt(0)
                ?.toUpperCase()}
            </div>

            <div>

              <h4 className="text-sm font-semibold">
                {message.sender?.name}
              </h4>

              <div className="flex items-center gap-2 text-xs opacity-70">

                <Clock3 size={12} />

                {time}

              </div>

            </div>

          </div>

          <button
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            className="rounded-xl p-2 transition hover:bg-black/10"
          >
            <MoreVertical size={18} />
          </button>

        </div>

        <div className="space-y-4 px-5 py-5"></div>
                  {/* REPLY PREVIEW */}

          {message.replyTo && (
            <div className="rounded-2xl border-l-4 border-cyan-400 bg-black/10 px-4 py-3">

              <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
                Replying to {message.replyTo.sender?.name}
              </p>

              <p className="mt-1 truncate text-sm opacity-80">
                {message.replyTo.text}
              </p>

            </div>
          )}

          {/* MESSAGE */}

          {message.text && (
            <p className="whitespace-pre-wrap break-words text-[15px] leading-8">
              {highlightText(message.text)}
            </p>
          )}

          {/* IMAGE */}

          {attachment?.url &&
            attachment.mimeType?.startsWith("image/") && (

              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/10">

                <img
                  src={attachment.url}
                  alt="attachment"
                  className="max-h-[420px] w-full cursor-pointer object-cover transition duration-300 hover:scale-[1.02]"
                />

                <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">

                  <div className="flex items-center gap-2 text-sm">

                    <ImageIcon size={16} />

                    <span className="truncate">
                      {attachment.originalName}
                    </span>

                  </div>

                  <a
                    href={attachment.url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-cyan-400 p-2 text-black transition hover:scale-105"
                  >
                    <Download size={16} />
                  </a>

                </div>

              </div>

          )}

          {/* PDF */}

          {attachment?.url &&
            attachment.mimeType ===
              "application/pdf" && (

              <a
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-2xl border border-[#314056] bg-[#101826] p-5 transition hover:border-cyan-400"
              >

                <div className="flex items-center gap-4">

                  <div className="rounded-2xl bg-red-500/10 p-4">

                    <FileText
                      size={30}
                      className="text-red-400"
                    />

                  </div>

                  <div>

                    <h4 className="font-semibold">
                      {attachment.originalName}
                    </h4>

                    <p className="mt-1 text-sm text-gray-400">
                      PDF Document
                    </p>

                  </div>

                </div>

                <Download
                  className="text-cyan-400"
                  size={22}
                />

              </a>

          )}

          {/* VIDEO */}

          {attachment?.url &&
            attachment.mimeType?.startsWith("video/") && (

              <div className="overflow-hidden rounded-2xl border border-white/10">

                <video
                  controls
                  className="max-h-[420px] w-full bg-black"
                >
                  <source
                    src={attachment.url}
                    type={attachment.mimeType}
                  />
                </video>

                <div className="flex items-center gap-2 border-t border-white/10 px-4 py-3 text-sm">

                  <Play size={16} />

                  {attachment.originalName}

                </div>

              </div>

          )}

          {/* AUDIO */}

          {attachment?.url &&
            attachment.mimeType?.startsWith("audio/") && (

              <div className="rounded-2xl border border-white/10 bg-black/10 p-5">

                <div className="mb-4 flex items-center gap-3">

                  <Music2
                    size={22}
                    className="text-cyan-400"
                  />

                  <div>

                    <h4 className="font-medium">
                      {attachment.originalName}
                    </h4>

                    <p className="text-sm text-gray-400">
                      Audio File
                    </p>

                  </div>

                </div>

                <audio
                  controls
                  preload="metadata"
                  className="w-full"
                >
                  <source
                    src={attachment.url}
                    type={attachment.mimeType}
                  />
                </audio>

              </div>

          )}

          {/* OTHER FILES */}

          {attachment?.url &&
            !attachment.mimeType?.startsWith("image/") &&
            !attachment.mimeType?.startsWith("video/") &&
            !attachment.mimeType?.startsWith("audio/") &&
            attachment.mimeType !==
              "application/pdf" && (

              <a
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-2xl border border-[#314056] bg-[#101826] p-5 transition hover:border-cyan-400"
              >

                <div className="flex items-center gap-4">

                  <div className="rounded-2xl bg-cyan-500/10 p-4">

                    <File
                      size={28}
                      className="text-cyan-400"
                    />

                  </div>

                  <div>

                    <h4 className="font-semibold">
                      {attachment.originalName}
                    </h4>

                    <p className="text-sm text-gray-400">
                      Attachment
                    </p>

                  </div>

                </div>

                <Download
                  size={22}
                  className="text-cyan-400"
                />

              </a>

          )}
                    {/* REACTIONS */}

          {message.reactions?.length > 0 && (
            <div className="flex flex-wrap gap-2">

              {message.reactions.map((reaction) => (

                <button
                  key={reaction.user}
                  className="flex items-center gap-1 rounded-full border border-white/10 bg-black/10 px-3 py-1.5 text-sm transition hover:scale-105 hover:border-cyan-400"
                >
                  <span>{reaction.emoji}</span>

                  <span className="text-xs opacity-70">
                    1
                  </span>

                </button>

              ))}

            </div>
          )}

        </div>

        {/* FOOTER */}

        <div
          className={`flex items-center justify-between border-t px-5 py-3 text-xs

          ${
            isMine
              ? "border-black/10"
              : "border-[#273347]"
          }`}
        >

          <div className="flex items-center gap-3 opacity-70">

            <span>
              {fullDate}
            </span>

            <span>
              •
            </span>

            <span>
              {time}
            </span>

            {message.edited && (
              <span className="italic">
                Edited
              </span>
            )}

          </div>

          {isMine && (

            <div className="flex items-center gap-1">

              {seen ? (
                <CheckCheck
                  size={17}
                  className="text-sky-500"
                />
              ) : (
                <Check
                  size={17}
                  className="opacity-70"
                />
              )}

            </div>

          )}

        </div>

        {/* QUICK REACTION */}

        <button
          onClick={reactHeart}
          className="absolute -left-5 top-1/2 hidden -translate-y-1/2 rounded-full border border-[#2D3B4F] bg-[#111827] p-2 shadow-xl transition hover:scale-110 hover:border-cyan-400 group-hover:flex"
        >
          <Heart
            size={17}
            className="text-red-400"
          />
        </button>

        {/* MENU */}

        {menuOpen && (

          <div className="absolute right-4 top-14 z-50">

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

          </div>

        )}
              </div>
    
  );
}

export default MessageBubble;