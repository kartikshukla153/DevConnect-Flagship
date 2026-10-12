import {
  BriefcaseBusiness,
  Code2,
  FolderKanban,
  GitBranch,
  Users,
} from "lucide-react";

function EvidenceCard({ icon: Icon, eyebrow, title, description }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B1220] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/25 hover:shadow-[0_18px_45px_rgba(34,211,238,0.08)]">
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
          <Icon size={21} className="text-cyan-400" />
        </div>

        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
          {eyebrow}
        </p>

        <h3 className="mt-2 text-lg font-semibold text-white">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          {description}
        </p>
      </div>
    </article>
  );
}

export default function Achievements({
  projects = [],
  skills = [],
  connections = [],
}) {
  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeSkills = Array.isArray(skills) ? skills : [];
  const safeConnections = Array.isArray(connections)
    ? connections
    : [];

  const hasDevConnect = safeProjects.some((project) =>
    String(project?.title || project?.name || "")
      .toLowerCase()
      .includes("devconnect")
  );

  const evidence = [
    ...(hasDevConnect
      ? [
          {
            icon: FolderKanban,
            eyebrow: "Flagship project",
            title: "DevConnect in the portfolio",
            description:
              "The profile contains a DevConnect project, giving recruiters a concrete product surface to inspect instead of relying only on skill claims.",
          },
        ]
      : []),

    {
      icon: BriefcaseBusiness,
      eyebrow: "Project evidence",
      title: `${safeProjects.length} project${
        safeProjects.length === 1 ? "" : "s"
      } represented`,
      description:
        "Project ownership or membership is reflected from the live project resource rather than a manually entered profile number.",
    },

    {
      icon: Code2,
      eyebrow: "Technical signal",
      title: `${safeSkills.length} technologie${
        safeSkills.length === 1 ? "y" : "s"
      } listed`,
      description:
        "These are the technologies currently represented by the developer profile. No additional skills are inferred from project names.",
    },

    {
      icon: Users,
      eyebrow: "Network signal",
      title: `${safeConnections.length} accepted connection${
        safeConnections.length === 1 ? "" : "s"
      }`,
      description:
        "The count reflects accepted DevConnect connections available to the current profile.",
    },

    {
      icon: GitBranch,
      eyebrow: "Engineering proof",
      title: "Source code is externally reachable",
      description:
        "GitHub is linked directly from the profile so recruiters can move from the product surface to the underlying implementation.",
    },
  ];

  return (
    <section className="rounded-[28px] border border-white/[0.08] bg-[#111827] p-7 shadow-[0_18px_60px_rgba(0,0,0,0.14)]">
      <div className="mb-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
          Evidence
        </p>

        <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
          Highlights & Evidence
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Recruiter-facing signals based on actual profile and platform
          data — not self-awarded badges.
        </p>
      </div>

      <div className="grid gap-4">
        {evidence.map((item, index) => (
          <EvidenceCard
            key={`${item.eyebrow}-${index}`}
            {...item}
          />
        ))}
      </div>

      <div className="mt-7 border-t border-white/10 pt-5">
        <p className="text-xs leading-5 text-slate-600">
          The strongest claims on a developer profile should be backed by
          something a recruiter can inspect.
        </p>
      </div>
    </section>
  );
}
