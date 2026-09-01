import {
  ArrowUpRight,
  FolderKanban,
  MessageSquare,
  Sparkles,
  SquarePen,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";

const actions = [
  {
    title: "New Project",
    description:
      "Create a collaborative workspace",
    icon: FolderKanban,
    to: "/projects/create",
    shortcut: "P",
    badge: "New",
  },
  {
    title: "Write Post",
    description:
      "Share an update with developers",
    icon: SquarePen,
    to: "/feed",
    shortcut: "N",
  },
  {
    title: "Find Developers",
    description:
      "Discover engineers to collaborate with",
    icon: Users,
    to: "/developers",
    shortcut: "D",
  },
  {
    title: "Messages",
    description:
      "Continue your conversations",
    icon: MessageSquare,
    to: "/messages",
    shortcut: "M",
  },
  {
    title: "AI Architect",
    description:
      "Design and reason about systems with AI",
    icon: Sparkles,
    to: "/ai",
    shortcut: "AI",
  },
];

export default function QuickActions() {
  return (
    <section className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#111827] p-6 shadow-[0_16px_60px_rgba(0,0,0,0.14)] sm:p-8">
      {/* HEADER */}
      <div className="mb-7">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,.6)]" />

          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Command center
          </h2>
        </div>

        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
          Launch the workflows you use most without leaving the dashboard.
        </p>
      </div>

      {/* ACTIONS */}
      <div className="space-y-3">
        {actions.map(
          (action) => {
            const Icon =
              action.icon;

            return (
              <Link
                key={action.title}
                to={action.to}
                className="group relative block overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0B1220] transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/25 hover:bg-[#0d1727] hover:shadow-[0_16px_45px_rgba(34,211,238,0.07)]"
              >
                {/* AMBIENT GLOW */}
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-400/[0.07] blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative flex items-center justify-between gap-4 p-4 sm:p-5">
                  {/* LEFT */}
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.06] transition-all duration-300 group-hover:scale-105 group-hover:border-cyan-400/20 group-hover:bg-cyan-400/[0.1]">
                      <Icon
                        size={21}
                        className="text-cyan-300"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold text-white">
                          {action.title}
                        </p>

                        {action.badge && (
                          <span className="rounded-full border border-emerald-400/10 bg-emerald-400/[0.06] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-emerald-300">
                            {action.badge}
                          </span>
                        )}
                      </div>

                      <p className="mt-0.5 truncate text-xs text-slate-600">
                        {action.description}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex shrink-0 flex-col items-end gap-2.5">
                    <span className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[10px] font-bold text-slate-600 transition group-hover:border-white/10 group-hover:text-slate-400">
                      {action.shortcut}
                    </span>

                    <ArrowUpRight
                      size={16}
                      className="text-slate-700 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-400"
                    />
                  </div>
                </div>
              </Link>
            );
          }
        )}
      </div>

      {/* FOOTER */}
      <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-5">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-700">
          Workspace shortcuts
        </p>

        <p className="text-[10px] font-medium text-slate-700">
          Use the command palette for more actions
        </p>
      </div>
    </section>
  );
}