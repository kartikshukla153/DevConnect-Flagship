import { useState } from "react";
import {
  Image,
  Code2,
  Smile,
  SendHorizontal,
  Sparkles,
} from "lucide-react";

function PostComposer({ onCreatePost }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [text, setText] = useState("");

  const handlePublish = () => {
    if (!text.trim()) return;

    onCreatePost(text);

    setText("");
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#111827]">
      {/* Header */}

      <div className="flex items-center justify-between border-b border-white/10 px-7 py-5">
        <div>
          <h2 className="text-xl font-bold text-white">
            Share an Update
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Keep your network updated with what you're building.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2">
          <Sparkles
            size={16}
            className="text-cyan-400"
          />

          <span className="text-sm font-medium text-cyan-300">
            AI Writing
          </span>
        </div>
      </div>

      {/* Body */}

      <div className="p-7">
        <div className="flex gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500 text-lg font-bold text-[#07131E]">
            {(user.name || "D")[0].toUpperCase()}
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-white">
              {user.name || "Developer"}
            </h3>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              placeholder="What are you building today?"
              spellCheck={false}
              className="mt-4 w-full resize-none bg-transparent text-[15px] leading-7 text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Footer */}

      <div className="flex flex-wrap items-center justify-between gap-5 border-t border-white/10 bg-[#0F172A]/50 px-7 py-5">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-500 hover:bg-cyan-500/10"
          >
            <Image
              size={17}
              className="text-cyan-400"
            />
            Image
          </button>

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-500 hover:bg-cyan-500/10"
          >
            <Code2
              size={17}
              className="text-cyan-400"
            />
            Code
          </button>

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-500 hover:bg-cyan-500/10"
          >
            <Smile
              size={17}
              className="text-cyan-400"
            />
            Emoji
          </button>
        </div>

        <button
          type="button"
          onClick={handlePublish}
          disabled={!text.trim()}
          className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-[#07131E] transition hover:scale-[1.03] hover:bg-cyan-400 active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          <SendHorizontal size={18} />
          Publish
        </button>
      </div>
    </section>
  );
}

export default PostComposer;