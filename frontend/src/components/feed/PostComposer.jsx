import { useRef, useState } from "react";
import {
  Code2,
  Image as ImageIcon,
  SendHorizontal,
  Smile,
  Sparkles,
  X,
  FileCode2,
} from "lucide-react";

const MAX_LENGTH = 5000;

const EMOJIS = [
  "🚀",
  "🔥",
  "💻",
  "⚡",
  "🎯",
  "✨",
  "🧠",
  "🤖",
  "❤️",
  "🙌",
  "👏",
  "💯",
  "😎",
  "😂",
  "😁",
  "🥳",
  "🎉",
  "👀",
  "💡",
  "🛠️",
  "🔧",
  "📦",
  "🌐",
  "☁️",
  "🐛",
  "✅",
  "❌",
  "⚙️",
  "📈",
  "📉",
  "🧪",
  "🧩",
  "🏆",
  "⭐",
  "❤️‍🔥",
  "🙃",
  "😅",
  "🤝",
  "🙏",
  "💪",
  "👨‍💻",
  "👩‍💻",
];

function PostComposer({ onCreatePost }) {
  const [text, setText] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [emojiOpen, setEmojiOpen] = useState(false);
  const [codeMode, setCodeMode] = useState(false);

  const textareaRef = useRef(null);
  const imageInputRef = useRef(null);

  let user = {};

  try {
    user = JSON.parse(
      localStorage.getItem("user") || "{}"
    );
  } catch {
    user = {};
  }

  const userName = user.name || "Developer";

  const avatarLetter = userName
    .charAt(0)
    .toUpperCase();

  const remainingCharacters =
    MAX_LENGTH - text.length;

  const canPublish =
  (text.trim().length > 0 || Boolean(selectedImage)) &&
  text.length <= MAX_LENGTH &&
  !publishing;
  /*
   * ============================================================
   * IMAGE SELECTION
   * ============================================================
   */

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("Image must be smaller than 5 MB.");
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const preview = URL.createObjectURL(file);

    setSelectedImage(file);
    setImagePreview(preview);
    setError("");

    event.target.value = "";
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(null);
    setImagePreview("");
  };

  /*
   * ============================================================
   * EMOJI
   * ============================================================
   */

  const insertEmoji = (emoji) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      setText((previous) => `${previous}${emoji}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const nextText =
      text.slice(0, start) +
      emoji +
      text.slice(end);

    if (nextText.length > MAX_LENGTH) {
      return;
    }

    setText(nextText);
    setEmojiOpen(false);

    requestAnimationFrame(() => {
      textarea.focus();

      const cursorPosition =
        start + emoji.length;

      textarea.setSelectionRange(
        cursorPosition,
        cursorPosition
      );
    });
  };

  /*
   * ============================================================
   * TEXT
   * ============================================================
   */

  const handleTextChange = (event) => {
    setText(event.target.value);

    if (error) {
      setError("");
    }
  };

  /*
   * ============================================================
   * CODE MODE
   * ============================================================
   */

  const toggleCodeMode = () => {
    setCodeMode((previous) => !previous);

    if (!codeMode) {
      setText((previous) =>
        previous
          ? previous
          : "```js\n\n```"
      );
    }
  };

  /*
   * ============================================================
   * PUBLISH
   * ============================================================
   */

  const handlePublish = async () => {
    const trimmedText = text.trim();

  if (
  (!trimmedText && !selectedImage) ||
  publishing
) {
  return;
}

    if (trimmedText.length > MAX_LENGTH) {
      setError(
        `Post cannot exceed ${MAX_LENGTH} characters.`
      );
      return;
    }

    try {
      setPublishing(true);
      setError("");

      const formData = new FormData();

      formData.append("content", trimmedText);

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      await onCreatePost(formData);

      setText("");
      removeImage();
      setCodeMode(false);
      setEmojiOpen(false);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to publish post. Please try again."
      );
    } finally {
      setPublishing(false);
    }
  };

  /*
   * ============================================================
   * KEYBOARD
   * ============================================================
   */

  const handleKeyDown = (event) => {
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key === "Enter"
    ) {
      event.preventDefault();

      if (canPublish) {
        handlePublish();
      }
    }
  };

  return (
    <section className="overflow-visible rounded-3xl border border-white/[0.08] bg-[#0F172A] shadow-xl shadow-black/10">
      {/* HEADER */}

      <div className="flex flex-col gap-4 border-b border-white/[0.07] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">
            Share an Update
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Share what you're building with your network.
          </p>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-full border border-cyan-500/15 bg-cyan-500/10 px-3.5 py-2">
          <Sparkles
            size={15}
            className="text-cyan-400"
          />

          <span className="text-xs font-semibold text-cyan-300">
            AI Writing
          </span>

          <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
            Soon
          </span>
        </div>
      </div>

      {/* BODY */}

      <div className="p-6">
        <div className="flex gap-4">
          {/* AVATAR */}

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-500 text-base font-black text-[#07131E] shadow-lg shadow-cyan-500/10">
            {avatarLetter}
          </div>

          {/* EDITOR */}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                {userName}
              </h3>

              <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-600">
                Public
              </span>

              {codeMode && (
                <span className="rounded-full border border-cyan-500/15 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-cyan-400">
                  Code
                </span>
              )}
            </div>

            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              rows={5}
              maxLength={MAX_LENGTH}
              placeholder={
                codeMode
                  ? "Write or paste your code..."
                  : "What are you building today?"
              }
              spellCheck={!codeMode}
              disabled={publishing}
              className={`mt-4 min-h-[130px] w-full resize-none bg-transparent text-[15px] leading-7 text-slate-200 outline-none placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60 ${
                codeMode
                  ? "font-mono text-sm"
                  : ""
              }`}
            />

            {/* IMAGE PREVIEW */}

            {imagePreview && (
              <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1220]">
                <img
                  src={imagePreview}
                  alt="Selected"
                  className="max-h-[420px] w-full object-contain"
                />

                <button
                  type="button"
                  onClick={removeImage}
                  disabled={publishing}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/70 text-white backdrop-blur transition hover:bg-black"
                  aria-label="Remove image"
                >
                  <X size={17} />
                </button>

                <div className="absolute bottom-3 left-3 rounded-lg border border-white/10 bg-black/70 px-2.5 py-1.5 text-[10px] text-slate-300 backdrop-blur">
                  {selectedImage?.name}
                </div>
              </div>
            )}

            {/* CHARACTER COUNT */}

            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-600">
                Press{" "}
                <span className="font-medium text-slate-500">
                  Ctrl + Enter
                </span>{" "}
                to publish
              </span>

              <span
                className={`text-[11px] font-medium ${
                  remainingCharacters < 200
                    ? "text-amber-400"
                    : "text-slate-600"
                }`}
              >
                {text.length.toLocaleString()} /{" "}
                {MAX_LENGTH.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-400">
              {error}
            </p>
          </div>
        )}
      </div>

      {/* FOOTER */}

      <div className="relative flex flex-col gap-4 border-t border-white/[0.07] bg-[#0B1220]/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        {/* ACTIONS */}

        <div className="flex flex-wrap gap-2">
          {/* IMAGE */}

          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
            onChange={handleImageSelect}
            className="hidden"
          />

          <button
            type="button"
            onClick={() =>
              imageInputRef.current?.click()
            }
            disabled={publishing}
            className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 text-xs font-medium text-slate-400 transition hover:border-cyan-500/20 hover:bg-cyan-500/[0.07] hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ImageIcon size={15} />
            {selectedImage ? "Change image" : "Image"}
          </button>

          {/* CODE */}

          <button
            type="button"
            onClick={toggleCodeMode}
            disabled={publishing}
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition ${
              codeMode
                ? "border-cyan-500/25 bg-cyan-500/10 text-cyan-300"
                : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:border-cyan-500/20 hover:bg-cyan-500/[0.07] hover:text-cyan-300"
            }`}
          >
            {codeMode ? (
              <FileCode2 size={15} />
            ) : (
              <Code2 size={15} />
            )}
            Code
          </button>

          {/* EMOJI */}

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setEmojiOpen((previous) => !previous)
              }
              disabled={publishing}
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition ${
                emojiOpen
                  ? "border-amber-500/25 bg-amber-500/10 text-amber-300"
                  : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:border-amber-500/20 hover:bg-amber-500/[0.07] hover:text-amber-300"
              }`}
            >
              <Smile size={15} />
              Emoji
            </button>

            {emojiOpen && (
              <div className="absolute bottom-12 left-0 z-[80] w-[280px] rounded-2xl border border-white/[0.1] bg-[#111827] p-3 shadow-2xl shadow-black/60">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Add emoji
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setEmojiOpen(false)
                    }
                    className="rounded-lg p-1 text-slate-600 transition hover:bg-white/[0.05] hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() =>
                        insertEmoji(emoji)
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-lg transition hover:bg-white/[0.07] hover:scale-110"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PUBLISH */}

        <button
          type="button"
          onClick={handlePublish}
          disabled={!canPublish}
          className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-[#07131E] transition-all duration-200 hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
        >
          {publishing ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#07131E]/30 border-t-[#07131E]" />
              Publishing...
            </>
          ) : (
            <>
              <SendHorizontal size={16} />
              Publish
            </>
          )}
        </button>
      </div>
    </section>
  );
}

export default PostComposer;