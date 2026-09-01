import {
  ArrowUpRight,
  CalendarDays,
  Command,
  Plus,
  Sparkles,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

function DashboardHeader() {
  const navigate = useNavigate();

  let user = {};

  try {
    user = JSON.parse(
      localStorage.getItem("user") || "{}"
    );
  } catch {
    user = {};
  }

  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) {
    greeting = "Good Morning";
  } else if (hour < 18) {
    greeting = "Good Afternoon";
  }

  const today = new Date().toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );

  const firstName =
    user?.name?.trim()?.split(" ")[0] ||
    user?.username?.trim()?.split(" ")[0] ||
    "Developer";

  const openCommandPalette = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        metaKey: true,
      })
    );
  };

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#111827] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
      {/* =========================================================
          AMBIENT BACKGROUND
      ========================================================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-cyan-500/[0.08] blur-[100px]" />

        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-sky-500/[0.05] blur-[100px]" />

        <div className="absolute right-[28%] top-0 h-px w-64 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
      </div>

      <div className="relative p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-9 xl:flex-row xl:items-end xl:justify-between">
          {/* =======================================================
              MAIN CONTENT
          ======================================================= */}

          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.08] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300 sm:text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />

                {greeting}
              </span>

              <span className="hidden text-xs text-slate-600 sm:inline">
                Developer Workspace
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
              Welcome back,
              <br />

              <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
                {firstName}.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Your engineering workspace for building projects,
              collaborating with developers, shipping work and
              growing your developer network.
            </p>

            {/* =====================================================
                PRIMARY ACTIONS
            ===================================================== */}

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  navigate("/projects/create")
                }
                className="group inline-flex items-center gap-2.5 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-[0_8px_30px_rgba(34,211,238,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-300 hover:shadow-[0_12px_40px_rgba(34,211,238,0.18)]"
              >
                <Plus
                  size={17}
                  className="transition-transform duration-300 group-hover:rotate-90"
                />

                New Project

                <ArrowUpRight
                  size={15}
                  className="opacity-50 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </button>

              <button
                type="button"
                onClick={() => navigate("/ai")}
                className="inline-flex items-center gap-2.5 rounded-xl border border-white/[0.10] bg-white/[0.03] px-5 py-3 text-sm font-semibold text-slate-200 transition-all duration-300 hover:border-cyan-400/20 hover:bg-cyan-400/[0.05] hover:text-cyan-300"
              >
                <Sparkles
                  size={16}
                  className="text-cyan-400"
                />

                Open AI Architect

                <ArrowUpRight
                  size={14}
                  className="text-slate-600"
                />
              </button>
            </div>
          </div>

          {/* =======================================================
              CONTEXT PANEL
          ======================================================= */}

          <div className="w-full xl:w-[330px] xl:shrink-0">
            <div className="space-y-3">
              {/* =================================================
                  DATE
              ================================================= */}

              <div className="rounded-2xl border border-white/[0.08] bg-[#0B1220]/80 p-4 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.08]">
                    <CalendarDays
                      size={18}
                      className="text-cyan-400"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
                      Today
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-white">
                      {today}
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  COMMAND PALETTE
              ================================================= */}

              <button
                type="button"
                onClick={openCommandPalette}
                className="group flex w-full items-center justify-between rounded-2xl border border-white/[0.08] bg-[#0B1220]/80 p-4 text-left transition-all duration-300 hover:border-cyan-400/20 hover:bg-cyan-400/[0.03]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03]">
                    <Command
                      size={17}
                      className="text-slate-400 transition-colors group-hover:text-cyan-400"
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
                      Quick Search
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-300">
                      Open Command Palette
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-[10px] font-bold text-slate-500">
                  ⌘ K
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DashboardHeader;