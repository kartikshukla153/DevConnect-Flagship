import { ArrowUpRight } from "lucide-react";

function CommandItem({
  icon: Icon,
  title,
  description,
  shortcut,
  active,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
        active
          ? "border-cyan-500/50 bg-cyan-500/10"
          : "border-white/5 bg-white/[0.02] hover:border-cyan-500/30 hover:bg-white/[0.05]"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg transition ${
            active
              ? "bg-cyan-500 text-black"
              : "bg-[#111827] text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black"
          }`}
        >
          <Icon size={18} />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>

          {description && (
            <p className="mt-1 text-xs text-gray-400">{description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {shortcut && (
          <kbd className="rounded border border-white/10 bg-[#111827] px-2 py-1 text-[10px] text-gray-400">
            {shortcut}
          </kbd>
        )}

        <ArrowUpRight
          size={16}
          className={`transition ${
            active
              ? "text-cyan-400"
              : "text-gray-500 group-hover:text-cyan-400"
          }`}
        />
      </div>
    </button>
  );
}

export default CommandItem;