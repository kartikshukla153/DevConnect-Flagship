import { useState } from "react";

function ChatSearch({
  search,
  setSearch,
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="px-4 py-3 border-b border-gray-700 bg-[#111827]">
      <div
        className={`flex items-center rounded-xl border transition-all ${
          focused
            ? "border-cyan-400 shadow-lg shadow-cyan-500/20"
            : "border-gray-700"
        }`}
      >
        <span className="px-3 text-gray-400">
          🔍
        </span>

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search messages..."
          className="
            w-full
            bg-transparent
            py-2
            pr-3
            outline-none
            text-white
            placeholder:text-gray-500
          "
        />
      </div>
    </div>
  );
}

export default ChatSearch;