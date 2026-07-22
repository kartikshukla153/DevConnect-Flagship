import {
  Award,
  Rocket,
  Users,
  Sparkles,
  Trophy,
  ShieldCheck,
} from "lucide-react";

const achievements = [
  {
    id: 1,
    title: "Flagship Builder",
    description:
      "Building DevConnect as a production-grade developer collaboration platform.",
    icon: Rocket,
  },
  {
    id: 2,
    title: "Full Stack Engineer",
    description:
      "Designing scalable MERN applications from frontend to backend.",
    icon: Award,
  },
  {
    id: 3,
    title: "Community Builder",
    description:
      "Connecting developers and encouraging real-world collaboration.",
    icon: Users,
  },
  {
    id: 4,
    title: "AI Explorer",
    description:
      "Using AI to improve developer productivity and workflows.",
    icon: Sparkles,
  },
  {
    id: 5,
    title: "Quality Focused",
    description:
      "Writing clean architecture with production-ready UI.",
    icon: ShieldCheck,
  },
  {
    id: 6,
    title: "Always Learning",
    description:
      "Learning continuously through challenging engineering projects.",
    icon: Trophy,
  },
];

export default function Achievements({
  items = achievements,
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#111827] p-8">

      <div className="mb-8">

        <h2 className="text-2xl font-bold text-white">
          Highlights
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Milestones that represent your developer journey.
        </p>

      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.id}
              className="
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                border-white/10
                bg-[#0B1220]
                p-6
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-cyan-400/30
                hover:shadow-[0_18px_45px_rgba(34,211,238,0.08)]
              "
            >

              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative">

                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-cyan-500/20
                    bg-cyan-500/10
                    transition-all
                    duration-300
                    group-hover:scale-110
                    group-hover:bg-cyan-500/20
                  "
                >
                  <Icon
                    size={24}
                    className="text-cyan-400"
                  />
                </div>

                <h3 className="mt-6 text-lg font-semibold text-white">
                  {item.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  {item.description}
                </p>

              </div>

            </article>
          );
        })}
              </div>

      <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">

        <div>

          <p className="text-sm text-slate-500">
            Strong engineering profiles are built through consistency,
            impactful projects and continuous learning.
          </p>

        </div>

        <button
          className="
            rounded-xl
            border
            border-white/10
            bg-white/5
            px-5
            py-2.5
            text-sm
            font-medium
            text-white
            transition-all
            duration-300
            hover:border-cyan-400/30
            hover:bg-cyan-500/10
          "
        >
          View Portfolio
        </button>

      </div>
          </section>
  );
}