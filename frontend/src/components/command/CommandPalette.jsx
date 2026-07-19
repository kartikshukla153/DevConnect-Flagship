import { useEffect, useMemo, useRef } from "react";
import { Search, CornerDownLeft } from "lucide-react";

import useCommandPalette from "../../hooks/useCommandPalette";
import { useCommandPaletteContext } from "../../context/CommandPaletteContext";

function ShortcutBadge({ shortcut }) {
  if (!shortcut) return null;

  return (
    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium tracking-wide text-slate-400">
      {shortcut}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Search
        size={42}
        className="mb-4 text-slate-600"
      />

      <h3 className="text-lg font-semibold text-white">
        No commands found
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
        Try searching for another page, action, project or developer.
      </p>
    </div>
  );
}

function CommandItem({
  command,
  active,
  onClick,
}) {
  const Icon = command.icon;

  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
        active
          ? "border-cyan-500/60 bg-cyan-500/10"
          : "border-transparent hover:border-white/10 hover:bg-white/5"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`rounded-lg p-2 ${
            active
              ? "bg-cyan-500/20"
              : "bg-white/5"
          }`}
        >
          <Icon
            size={18}
            className={
              active
                ? "text-cyan-400"
                : "text-slate-400"
            }
          />
        </div>

        <div>
          <h4 className="font-medium text-white">
            {command.title}
          </h4>

          <p className="mt-1 text-xs text-slate-400">
            {command.description}
          </p>
        </div>
      </div>

      <ShortcutBadge shortcut={command.shortcut} />
    </button>
  );
}

export default function CommandPalette() {
  const {
    isOpen,
    closePalette,
  } = useCommandPaletteContext();

  const {
    query,
    setQuery,

    groupedCommands,
    filteredCommands,

    selectedIndex,
    setSelectedIndex,

    executeCommand,
    executeSelected,

    moveDown,
    moveUp,
  } = useCommandPalette();

  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handler = (event) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          moveDown();
          break;

        case "ArrowUp":
          event.preventDefault();
          moveUp();
          break;

        case "Enter":
          event.preventDefault();
          executeSelected();
          break;

        case "Escape":
          event.preventDefault();
          closePalette();
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", handler);

    return () =>
      window.removeEventListener(
        "keydown",
        handler
      );
  }, [
    isOpen,
    moveDown,
    moveUp,
    executeSelected,
    closePalette,
  ]);

  const groupedEntries = useMemo(
    () => Object.entries(groupedCommands),
    [groupedCommands]
  );

  if (!isOpen) return null;
    let commandIndex = -1;

  return (
    <>
      <div
        onClick={closePalette}
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      />

      <div className="fixed inset-0 z-[9999] flex items-start justify-center px-4 pt-[10vh]">
        <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#111827]/95 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl animate-in zoom-in-95 fade-in duration-200">

          {/* Header */}

          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">

            <Search
              size={18}
              className="text-slate-500"
            />

            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for pages, projects, developers or actions..."
              spellCheck={false}
              autoComplete="off"
              className="flex-1 bg-transparent text-[15px] text-white placeholder:text-slate-500 focus:outline-none"
            />

            <div className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
              ESC
            </div>

          </div>

          {/* Results */}

          <div className="max-h-[65vh] overflow-y-auto">

            {filteredCommands.length === 0 && (
              <EmptyState />
            )}

            {groupedEntries.map(([group, items]) => (
              <div
                key={group}
                className="border-b border-white/5 last:border-none"
              >

                <div className="sticky top-0 z-10 bg-[#111827]/95 px-5 pt-5 pb-2 backdrop-blur">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {group}
                  </h3>
                </div>

                <div className="space-y-1 px-3 pb-4">

                
                                  {items.map((command) => {
                    commandIndex++;

                    const isActive =
                      commandIndex === selectedIndex;

                    return (
                      <div
                        key={command.id}
                        onMouseEnter={() =>
                          setSelectedIndex(commandIndex)
                        }
                        className="mb-1 last:mb-0"
                      >
                        <CommandItem
                          command={command}
                          active={isActive}
                          onClick={() =>
                            executeCommand(command)
                          }
                        />
                      </div>
                    );
                  })}
                  
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}

          <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.02] px-5 py-3">

            <div className="flex items-center gap-4 text-xs text-slate-500">

              <div className="flex items-center gap-2">
                <kbd className="rounded border border-white/10 bg-white/5 px-2 py-1">
                  ↑
                </kbd>

                <kbd className="rounded border border-white/10 bg-white/5 px-2 py-1">
                  ↓
                </kbd>

                <span>Navigate</span>
              </div>

              <div className="flex items-center gap-2">
                <kbd className="rounded border border-white/10 bg-white/5 px-2 py-1">
                  <CornerDownLeft size={12} />
                </kbd>

                <span>Open</span>
              </div>

            </div>

            <div className="text-xs text-slate-500">
              {filteredCommands.length} command
              {filteredCommands.length !== 1 ? "s" : ""}
            </div>

          </div>
                  </div>
      </div>
    </>
  );
}