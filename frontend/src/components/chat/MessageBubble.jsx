import { useEffect, useState } from "react";
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
  Pencil,
  Play,
  Reply,
  Trash2,
  X,
  Send,
} from "lucide-react";

import MessageActionMenu from "./MessageActionMenu";

function MessageBubble({
  message,
  isMine,
  onReply,
  search,
  onImageClick,
  onEdit,
  onDelete,
  onReact,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState(
    message.text || ""
  );
  const [savingEdit, setSavingEdit] = useState(false);

  const attachment = message.attachment;
  const deleted = Boolean(message.deleted);

  const seen =
    isMine &&
    Array.isArray(message.readBy) &&
    message.readBy.length > 1;

  useEffect(() => {
    if (!editing) {
      setDraftText(message.text || "");
    }
  }, [message.text, editing]);

  const highlightText = (text) => {
    if (!search?.trim()) return text;

    const escapedSearch = search
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const regex = new RegExp(
      `(${escapedSearch})`,
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
          <span key={index}>{part}</span>
        )
      );
  };

  const createdDate = new Date(
    message.createdAt
  );

  const time = createdDate.toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const fullDate =
    createdDate.toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const startEditing = () => {
    if (
      !isMine ||
      deleted ||
      !message.text
    ) {
      return;
    }

    setDraftText(message.text);
    setEditing(true);
    setMenuOpen(false);
  };

  const cancelEditing = () => {
    setDraftText(message.text || "");
    setEditing(false);
    setSavingEdit(false);
  };

  const saveEdit = async () => {
    const nextText = draftText.trim();

    if (!nextText) return;

    if (
      nextText ===
      (message.text || "").trim()
    ) {
      setEditing(false);
      return;
    }

    if (!onEdit) return;

    try {
      setSavingEdit(true);

      const success = await onEdit(
        message,
        nextText
      );

      if (success) {
        setEditing(false);
      }
    } finally {
      setSavingEdit(false);
    }
  };

  const handleEditKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
      return;
    }

    if (
      event.key === "Enter" &&
      (event.ctrlKey || event.metaKey)
    ) {
      event.preventDefault();
      saveEdit();
    }
  };

  const handleReply = () => {
    if (!onReply || deleted) return;

    onReply(message);
    setMenuOpen(false);
  };

  const handleReact = () => {
    if (!onReact || deleted) return;

    onReact(message, "❤️");
    setMenuOpen(false);
  };

  const handleDelete = () => {
    if (!onDelete || !isMine || deleted) {
      return;
    }

    setMenuOpen(false);
    onDelete(message);
  };

  return (
    <div
      className={`group flex w-full ${
        isMine
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`relative max-w-[82%] rounded-[26px] border shadow-xl transition-all duration-300 hover:shadow-cyan-500/10 lg:max-w-[68%] ${
          isMine
            ? "border-cyan-400/20 bg-gradient-to-br from-cyan-400 to-cyan-500 text-black"
            : "border-[#2B3648] bg-[#151E2C] text-white"
        }`}
      >
        {/* HEADER */}

        <div
          className={`flex items-center justify-between border-b px-5 py-3 ${
            isMine
              ? "border-black/10"
              : "border-white/10"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                isMine
                  ? "bg-black/15"
                  : "bg-cyan-500 text-black"
              }`}
            >
              {message.sender?.name
                ?.charAt(0)
                ?.toUpperCase() || "?"}
            </div>

            <div>
              <h4 className="text-sm font-semibold">
                {message.sender?.name ||
                  "Developer"}
              </h4>

              <div className="flex items-center gap-2 text-xs opacity-70">
                <Clock3 size={12} />
                {time}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            className="rounded-xl p-2 transition hover:bg-black/10"
            aria-label="Message actions"
            aria-expanded={menuOpen}
          >
            <MoreVertical size={18} />
          </button>
        </div>

        {/* CONTENT */}

        <div className="space-y-4 px-5 py-5">
          {/* REPLY PREVIEW */}

          {message.replyTo && (
            <div className="rounded-2xl border-l-4 border-cyan-400 bg-black/10 px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-70">
                <Reply size={13} />

                <span>
                  Replying to{" "}
                  {message.replyTo.sender?.name ||
                    "Developer"}
                </span>
              </div>

              <p className="mt-1 truncate text-sm opacity-80">
                {message.replyTo.deleted
                  ? "This message was deleted"
                  : message.replyTo.text ||
                    "Attachment"}
              </p>
            </div>
          )}

          {/* DELETED MESSAGE */}

          {deleted ? (
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/10 px-4 py-4">
              <Trash2
                size={17}
                className="shrink-0 opacity-60"
              />

              <p className="text-sm italic opacity-60">
                This message was deleted
              </p>
            </div>
          ) : editing ? (
            /* INLINE EDITOR */
            <div className="space-y-3">
              <div className="rounded-2xl border border-black/20 bg-white/10 p-3">
                <textarea
                  value={draftText}
                  onChange={(event) =>
                    setDraftText(
                      event.target.value
                    )
                  }
                  onKeyDown={
                    handleEditKeyDown
                  }
                  autoFocus
                  rows={4}
                  maxLength={5000}
                  disabled={savingEdit}
                  className="w-full resize-none bg-transparent text-[15px] leading-7 outline-none placeholder:text-black/40"
                  placeholder="Edit your message..."
                />

                <div className="mt-2 flex items-center justify-between text-[11px] opacity-60">
                  <span>
                    Ctrl/Cmd + Enter to save
                    · Esc to cancel
                  </span>

                  <span>
                    {draftText.length}/5000
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={savingEdit}
                  className="flex items-center gap-2 rounded-xl border border-black/15 bg-black/5 px-3 py-2 text-xs font-semibold transition hover:bg-black/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={14} />
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={
                    savingEdit ||
                    !draftText.trim()
                  }
                  className="flex items-center gap-2 rounded-xl bg-black px-3 py-2 text-xs font-semibold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={14} />

                  {savingEdit
                    ? "Saving..."
                    : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* MESSAGE */}

              {message.text && (
                <p className="whitespace-pre-wrap break-words text-[15px] leading-8">
                  {highlightText(
                    message.text
                  )}
                </p>
              )}

              {/* IMAGE */}

              {attachment?.url &&
                attachment.mimeType?.startsWith(
                  "image/"
                ) && (
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/10">
                    <img
                      src={attachment.url}
                      alt={
                        attachment.originalName ||
                        "Attachment"
                      }
                      onClick={() =>
                        onImageClick?.(
                          attachment.url
                        )
                      }
                      className="max-h-[420px] w-full cursor-pointer object-cover transition duration-300 hover:scale-[1.02]"
                    />

                    <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
                      <div className="flex min-w-0 items-center gap-2 text-sm">
                        <ImageIcon size={16} />

                        <span className="truncate">
                          {attachment.originalName ||
                            "Image"}
                        </span>
                      </div>

                      <a
                        href={attachment.url}
                        download
                        target="_blank"
                        rel="noreferrer"
                        onClick={(event) =>
                          event.stopPropagation()
                        }
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

                      <div className="min-w-0">
                        <h4 className="truncate font-semibold">
                          {attachment.originalName ||
                            "PDF Document"}
                        </h4>

                        <p className="mt-1 text-sm text-gray-400">
                          PDF Document
                        </p>
                      </div>
                    </div>

                    <Download
                      className="shrink-0 text-cyan-400"
                      size={22}
                    />
                  </a>
                )}

              {/* VIDEO */}

              {attachment?.url &&
                attachment.mimeType?.startsWith(
                  "video/"
                ) && (
                  <div className="overflow-hidden rounded-2xl border border-white/10">
                    <video
                      controls
                      className="max-h-[420px] w-full bg-black"
                    >
                      <source
                        src={attachment.url}
                        type={
                          attachment.mimeType
                        }
                      />
                    </video>

                    <div className="flex items-center gap-2 border-t border-white/10 px-4 py-3 text-sm">
                      <Play size={16} />

                      <span className="truncate">
                        {attachment.originalName ||
                          "Video"}
                      </span>
                    </div>
                  </div>
                )}

              {/* AUDIO */}

              {attachment?.url &&
                attachment.mimeType?.startsWith(
                  "audio/"
                ) && (
                  <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <Music2
                        size={22}
                        className="text-cyan-400"
                      />

                      <div className="min-w-0">
                        <h4 className="truncate font-medium">
                          {attachment.originalName ||
                            "Audio"}
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
                        type={
                          attachment.mimeType
                        }
                      />
                    </audio>
                  </div>
                )}

              {/* OTHER FILES */}

              {attachment?.url &&
                !attachment.mimeType?.startsWith(
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
                    className="flex items-center justify-between rounded-2xl border border-[#314056] bg-[#101826] p-5 transition hover:border-cyan-400"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="rounded-2xl bg-cyan-500/10 p-4">
                        <File
                          size={28}
                          className="text-cyan-400"
                        />
                      </div>

                      <div className="min-w-0">
                        <h4 className="truncate font-semibold">
                          {attachment.originalName ||
                            "Attachment"}
                        </h4>

                        <p className="mt-1 text-sm text-gray-400">
                          Attachment
                        </p>
                      </div>
                    </div>

                    <Download
                      size={22}
                      className="shrink-0 text-cyan-400"
                    />
                  </a>
                )}
            </>
          )}

          {/* REACTIONS */}

          {!deleted &&
            message.reactions?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {message.reactions.map(
                  (reaction, index) => (
                    <button
                      key={`${reaction.user}-${index}`}
                      type="button"
                      onClick={() =>
                        handleReact()
                      }
                      className="flex items-center gap-1 rounded-full border border-white/10 bg-black/10 px-3 py-1.5 text-sm transition hover:scale-105 hover:border-cyan-400"
                      title="Toggle reaction"
                    >
                      <span>
                        {reaction.emoji}
                      </span>

                      <span className="text-xs opacity-70">
                        1
                      </span>
                    </button>
                  )
                )}
              </div>
            )}
        </div>

        {/* FOOTER */}

        <div
          className={`flex items-center justify-between border-t px-5 py-3 text-xs ${
            isMine
              ? "border-black/10"
              : "border-[#273347]"
          }`}
        >
          <div className="flex items-center gap-3 opacity-70">
            <span>{fullDate}</span>

            <span>•</span>

            <span>{time}</span>

            {message.edited &&
              !deleted && (
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

        {!deleted && !editing && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleReact();
            }}
            className="absolute -left-5 top-1/2 hidden -translate-y-1/2 rounded-full border border-[#2D3B4F] bg-[#111827] p-2 shadow-xl transition hover:scale-110 hover:border-cyan-400 group-hover:flex"
            aria-label="React with heart"
          >
            <Heart
              size={17}
              className="text-red-400"
            />
          </button>
        )}

        {/* ACTION MENU */}

        {menuOpen && !editing && (
          <div
            className="absolute right-4 top-14 z-50"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <MessageActionMenu
              message={message}
              isMine={isMine}
              onReply={handleReply}
              onEdit={startEditing}
              onDelete={handleDelete}
              onReact={handleReact}
              onClose={() =>
                setMenuOpen(false)
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;