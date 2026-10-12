import {
  BriefcaseBusiness,
  CalendarDays,
  GraduationCap,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function getType(item) {
  return String(item?.type || item?.kind || "Experience");
}

function TimelineIcon({ type }) {
  return type.toLowerCase() === "education" ? (
    <GraduationCap size={18} className="text-cyan-400" />
  ) : (
    <BriefcaseBusiness size={18} className="text-cyan-400" />
  );
}

function ExperienceCard({ item, index, total }) {
  const type = getType(item);

  return (
    <div className="group flex gap-5 sm:gap-6">
      <div className="flex flex-col items-center">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 transition-all duration-300 group-hover:scale-105 group-hover:bg-cyan-500/20">
          <TimelineIcon type={type} />
        </div>

        {index !== total - 1 && (
          <div className="mt-3 min-h-10 w-px flex-1 bg-gradient-to-b from-cyan-500/40 to-transparent" />
        )}
      </div>

      <article className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#0B1220] p-5 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-cyan-400/25 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-semibold text-white sm:text-xl">
                {item?.title || "Untitled role"}
              </h3>

              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                {type}
              </span>
            </div>

            <p className="mt-2 text-sm font-medium text-slate-300">
              {item?.company || item?.organization || "Independent"}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 text-xs text-slate-500">
            <CalendarDays size={15} />
            <span>{item?.duration || item?.period || "Ongoing"}</span>
          </div>
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-400">
          {item?.description ||
            "No additional details have been added for this entry yet."}
        </p>
      </article>
    </div>
  );
}

export default function ExperienceTimeline({
  experience = [],
  profile = null,
}) {
  const navigate = useNavigate();
  const realExperience = Array.isArray(experience)
    ? experience.filter(Boolean)
    : [];

  const education = {
    id: "education-uiet",
    title: "B.E. Computer Science",
    company: "UIET, Panjab University",
    type: "Education",
    duration: "Ongoing",
    description:
      "Computer Science engineering education with a focus on data structures, algorithms, full-stack development and software engineering fundamentals.",
  };

  const items =
    realExperience.length > 0
      ? realExperience
      : [education];

  return (
    <section className="rounded-[28px] border border-white/[0.08] bg-[#111827] p-7 shadow-[0_18px_60px_rgba(0,0,0,0.14)] sm:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
            Career
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
            Experience & Education
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Only information represented by the profile is shown here.
            Projects are not presented as employment history.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/add-experience")}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:border-cyan-400/25 hover:bg-cyan-400/[0.06] hover:text-cyan-300"
        >
          <Plus size={14} />
          Add Experience
        </button>
      </div>

      <div className="space-y-7">
        {items.map((item, index) => (
          <ExperienceCard
            key={item?.id || item?._id || index}
            item={item}
            index={index}
            total={items.length}
          />
        ))}
      </div>

      {realExperience.length === 0 && (
        <div className="mt-7 rounded-2xl border border-dashed border-white/10 bg-[#0B1220] p-5">
          <p className="text-sm font-semibold text-white">
            No professional experience added yet.
          </p>
          <p className="mt-1 text-xs leading-6 text-slate-500">
            Add internships, freelance work, employment or meaningful
            engineering roles when you have them. The profile will then
            show those entries above the education record.
          </p>
        </div>
      )}

      <div className="mt-8 border-t border-white/10 pt-5">
        <p className="text-xs leading-5 text-slate-600">
          {profile?.user?.name
            ? `${profile.user.name}'s`
            : "Your"}{" "}
          timeline is intentionally evidence-first: no job history is
          inferred from project ownership.
        </p>
      </div>
    </section>
  );
}
