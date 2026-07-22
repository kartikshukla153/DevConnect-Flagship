import {
  FolderKanban,
  SquarePen,
  Users,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  Plus,
  Command,
} from "lucide-react";

import { Link } from "react-router-dom";

const actions = [
  {
    title: "New Project",
    description: "Create a collaborative workspace",
    icon: FolderKanban,
    to: "/projects/create",
    shortcut: "P",
  },
  {
    title: "Write Post",
    description: "Share updates with developers",
    icon: SquarePen,
    to: "/feed",
    shortcut: "N",
  },
  {
    title: "Find Developers",
    description: "Discover engineers to collaborate",
    icon: Users,
    to: "/developers",
    shortcut: "D",
  },
  {
    title: "Messages",
    description: "Continue recent conversations",
    icon: MessageSquare,
    to: "/messages",
    shortcut: "M",
  },
  {
    title: "AI Architect",
    description: "Design scalable systems with AI",
    icon: Sparkles,
    to: "/ai",
    shortcut: "AI",
  },
];

function QuickActions() {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#111827] p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Command Center
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Launch your most-used workflows without leaving the dashboard.
          </p>
        </div>

        <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-[#0B1220] px-3 py-2 text-xs text-slate-400 xl:flex">
          <Command size={14} />
          <span>K</span>
        </div>
      </div>

      <div className="space-y-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              to={action.to}
              className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-[#0B1220] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-[0_16px_45px_rgba(34,211,238,0.08)]"
            >
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-500/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/10 bg-cyan-500/10 transition-all duration-300 group-hover:scale-105 group-hover:rotate-6 group-hover:bg-cyan-500/20">
                    <Icon
                      size={24}
                      className="text-cyan-400"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">
                        {action.title}
                      </h3>

                      {action.title === "New Project" && (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                          New
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-slate-400">
                      {action.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-400">
                    {action.shortcut}
                  </div>

                  <ArrowUpRight
                    size={18}
                    className="text-slate-500 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-cyan-400"
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-cyan-500/20 bg-cyan-500/5 py-4 font-semibold text-cyan-300 transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-500/10">
        <Plus size={18} />
        Customize Shortcuts
      </button>
    </section>
  );
}

export default QuickActions;