import { useEffect, useMemo, useRef } from "react";
import {
  Search,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  X,
  Clock3,
  Sparkles,
} from "lucide-react";

import useCommandPalette from "../../hooks/useCommandPalette";
import { useCommandPaletteContext } from "../../context/CommandPaletteContext";

function ShortcutBadge({ shortcut }) {
  if (!shortcut) return null;

  return (
    <span className="shrink-0 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[10px] font-medium tracking-wide text-slate-500">
      {shortcut}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
        <Search size={24} className="text-slate-600" />
      </div>

      <h3 className="text-sm font-semibold text-white">
        No commands found
      </h3>

      <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
        Try searching for a page, project, developer, action, or AI feature.
      </p>
    </div>
  );
}

function CommandItem({
  command,
  active,
  onClick,
  onMouseEnter,
}) {
  const Icon = command.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`group relative flex w-full items-center justify-between gap-4 rounded-xl border px-3 py-3 text-left transition-all duration-150 ${
        active
          ? "border-cyan-400/20 bg-cyan-400/[0.07]"
          : "border-transparent hover:border-white/[0.06] hover:bg-white/[0.035]"
      }`}
    >
      {active && (
        <div className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-cyan-400" />
      )}

      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
            active
              ? "border-cyan-400/20 bg-cyan-400/10"
              : "border-white/[0.06] bg-white/[0.025]"
          }`}
        >
          <Icon
            size={16}
            className={
              active ? "text-cyan-300" : "text-slate-500"
            }
          />
        </div>

        <div className="min-w-0">
          <h4
            className={`truncate text-sm font-medium ${
              active ? "text-white" : "text-slate-200"
            }`}
          >
            {command.title}
          </h4>

          <p className="mt-0.5 truncate text-[11px] text-slate-500">
            {command.description}
          </p>
        </div>
      </div>

      <ShortcutBadge shortcut={command.shortcut} />
    </button>
  );
}

export default function CommandPalette() {
  const { isOpen, closePalette, recentCommands } =
    useCommandPaletteContext();

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

    return () => {
      window.removeEventListener("keydown", handler);
    };
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

  const recentVisible = useMemo(() => {
    if (query.trim()) return [];

    const visibleIds = new Set(
      filteredCommands.map((command) => command.id)
    );

    return recentCommands.filter((command) =>
      visibleIds.has(command.id)
    );
  }, [query, recentCommands, filteredCommands]);

  if (!isOpen) return null;

  let commandIndex = -1;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closePalette}
        className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-[6px]"
      />

      {/* Palette */}
      <div className="fixed inset-0 z-[9999] flex items-start justify-center px-4 pt-[9vh]">
        <div
          className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0d1420]/[98%] shadow-[0_30px_100px_rgba(0,0,0,0.65)]"
          onClick={(event) => event.stopPropagation()}
        >
          {/* Search Header */}
          <div className="border-b border-white/[0.07]">
            <div className="flex items-center gap-3 px-5 py-4">
              <Search
                size={19}
                className="shrink-0 text-slate-500"
              />

              <input
                ref={inputRef}
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Search DevConnect..."
                spellCheck={false}
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-slate-600"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="rounded-lg p-1.5 text-slate-600 transition hover:bg-white/[0.05] hover:text-slate-300"
                >
                  <X size={15} />
                </button>
              )}

              <kbd className="hidden rounded-lg border border-white/[0.08] bg-white/[0.035] px-2 py-1 text-[10px] font-medium text-slate-500 sm:block">
                ESC
              </kbd>
            </div>

            {/* Premium accent line */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
          </div>

          {/* Results */}
          <div className="max-h-[62vh] overflow-y-auto">
            {/* Recent */}
            {!query.trim() && recentVisible.length > 0 && (
              <div className="border-b border-white/[0.06] px-3 pb-3 pt-4">
                <div className="flex items-center gap-2 px-2 pb-2">
                  <Clock3
                    size={12}
                    className="text-slate-600"
                  />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                    Recent
                  </span>
                </div>

                {recentVisible.map((command) => {
                  commandIndex++;

                  const active =
                    commandIndex === selectedIndex;

                  return (
                    <CommandItem
                      key={`recent-${command.id}`}
                      command={command}
                      active={active}
                      onMouseEnter={() =>
                        setSelectedIndex(commandIndex)
                      }
                      onClick={() =>
                        executeCommand(command)
                      }
                    />
                  );
                })}
              </div>
            )}

            {/* Empty */}
            {filteredCommands.length === 0 && (
              <EmptyState />
            )}

            {/* Groups */}
            {groupedEntries.map(([group, items]) => (
              <div
                key={group}
                className="border-b border-white/[0.05] last:border-none"
              >
                <div className="sticky top-0 z-10 bg-[#0d1420]/95 px-5 pb-2 pt-5 backdrop-blur-xl">
                  <div className="flex items-center gap-2">
                    {group === "AI" && (
                      <Sparkles
                        size={12}
                        className="text-cyan-400"
                      />
                    )}

                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                      {group}
                    </h3>
                  </div>
                </div>

                <div className="space-y-1 px-3 pb-4">
                  {items.map((command) => {
                    commandIndex++;

                    const active =
                      commandIndex === selectedIndex;

                    return (
                      <CommandItem
                        key={command.id}
                        command={command}
                        active={active}
                        onMouseEnter={() =>
                          setSelectedIndex(commandIndex)
                        }
                        onClick={() =>
                          executeCommand(command)
                        }
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/[0.07] bg-white/[0.015] px-5 py-3">
            <div className="flex items-center gap-4 text-[10px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <kbd className="flex h-5 w-5 items-center justify-center rounded border border-white/[0.07] bg-white/[0.03]">
                  <ArrowUp size={10} />
                </kbd>

                <kbd className="flex h-5 w-5 items-center justify-center rounded border border-white/[0.07] bg-white/[0.03]">
                  <ArrowDown size={10} />
                </kbd>

                <span className="ml-1">Navigate</span>
              </div>

              <div className="hidden items-center gap-1.5 sm:flex">
                <kbd className="flex h-5 w-5 items-center justify-center rounded border border-white/[0.07] bg-white/[0.03]">
                  <CornerDownLeft size={10} />
                </kbd>

                <span className="ml-1">Open</span>
              </div>
            </div>

            <div className="text-[10px] font-medium text-slate-600">
              {filteredCommands.length}{" "}
              {filteredCommands.length === 1
                ? "command"
                : "commands"}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}