import { CalendarDays, CircleDot, Layers3, Sparkles } from "lucide-react";

export default function ProjectHeader({ project }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0E1725] px-5 py-6 sm:px-7 sm:py-7">
      <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-cyan-400/[0.07] blur-3xl" />
      <div className="relative">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">
          <Sparkles size={13} /> AI-generated engineering plan
          <span className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-2 py-1 text-[9px] tracking-wide text-emerald-300">Workspace ready</span>
        </div>
        <h1 className="mt-4 max-w-4xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">{project.title}</h1>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-400">{project.overview || project.description || "No project overview is available yet."}</p>
        <div className="mt-5 flex flex-wrap gap-4 border-t border-white/[0.06] pt-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5"><CircleDot size={13} /> {project.difficulty || "Difficulty not set"}</span>
          <span className="inline-flex items-center gap-1.5"><CalendarDays size={13} /> {project.estimatedWeeks || "—"} week estimate</span>
          <span className="inline-flex items-center gap-1.5"><Layers3 size={13} /> {project.techStack?.length || 0} technologies</span>
        </div>
      </div>
    </section>
  );
}
