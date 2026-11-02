import { Layers3 } from "lucide-react";

export default function TechStack({ techStack = [] }) {
  const technologies = [...new Set(techStack.filter((item) => typeof item === "string" && item.trim()))];

  if (!technologies.length) {
    return <p className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-xs text-slate-500">No technologies have been specified for this workspace.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {technologies.map((technology) => (
        <span key={technology} className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#111C2B] px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-cyan-300/25 hover:text-cyan-100">
          <Layers3 size={12} className="text-cyan-400/70" />
          {technology}
        </span>
      ))}
    </div>
  );
}
