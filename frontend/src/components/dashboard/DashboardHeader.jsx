import { CalendarDays, Command, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

function DashboardHeader() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) greeting = "Good Morning";
  else if (hour < 18) greeting = "Good Afternoon";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#111827] p-8 shadow-2xl shadow-black/20 lg:p-10">
      {/* Accent Glow */}

      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-sky-500/5 blur-3xl" />

      <div className="relative flex flex-col justify-between gap-10 lg:flex-row lg:items-center">
        {/* LEFT */}

        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
            {greeting}
          </span>

          <h1 className="mt-6 text-4xl font-black tracking-tight text-white lg:text-5xl">
            Welcome back,
            <br />
            <span className="bg-gradient-to-r from-cyan-300 to-sky-400 bg-clip-text text-transparent">
              {user.name || "Developer"}
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 lg:text-lg">
            Manage projects, collaborate with developers, track your
            engineering activity and build a portfolio that stands out.
          </p>
        </div>

        {/* RIGHT */}

        <div className="flex w-full flex-col gap-4 lg:w-auto">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0B1220] px-5 py-4 lg:min-w-[320px]">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-cyan-500/10 p-3">
                <CalendarDays className="text-cyan-400" size={18} />
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  Today
                </p>

                <p className="mt-1 text-sm font-medium text-white">
                  {today}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0B1220] px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500">
                Quick Search
              </p>

              <p className="mt-1 text-sm text-slate-300">
                Open Command Palette
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-300">
              <Command size={16} />
              <span>K</span>
            </div>
          </div>

          <button
            onClick={() => navigate("/projects/create")}
            className="group flex items-center justify-center gap-3 rounded-2xl bg-cyan-500 px-6 py-4 font-semibold text-slate-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-400"
          >
            <Plus
              size={18}
              className="transition-transform duration-300 group-hover:rotate-90"
            />

            New Project
          </button>
        </div>
      </div>
    </section>
  );
}

export default DashboardHeader;