import {
  BriefcaseBusiness,
  CalendarDays,
  GraduationCap,
} from "lucide-react";

const demoExperience = [
  {
    id: 1,
    title: "Building DevConnect",
    company: "Personal Flagship Project",
    type: "Current",
    duration: "2026 - Present",
    description:
      "Developing a full-stack developer collaboration platform featuring real-time messaging, AI-powered tools, project management, notifications and scalable backend architecture.",
  },
  {
    id: 2,
    title: "Full Stack MERN Developer",
    company: "Furniture E-Commerce",
    type: "Project",
    duration: "2026",
    description:
      "Built a production-ready ecommerce application with JWT authentication, role-based authorization, admin dashboard, payment integration and responsive UI.",
  },
  {
    id: 3,
    title: "Computer Science Engineering",
    company: "UIET, Panjab University",
    type: "Education",
    duration: "Ongoing",
    description:
      "Focused on Data Structures, Algorithms, Full Stack Development and scalable web application architecture.",
  },
];

function TimelineIcon({ type }) {
  if (type === "Education") {
    return (
      <GraduationCap
        size={18}
        className="text-cyan-400"
      />
    );
  }

  return (
    <BriefcaseBusiness
      size={18}
      className="text-cyan-400"
    />
  );
}

export default function ExperienceTimeline({
  experience = demoExperience,
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#111827] p-8">

      <div className="mb-10">

        <h2 className="text-2xl font-bold text-white">
          Experience Timeline
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          A timeline of projects, education and engineering work.
        </p>

      </div>

      <div className="space-y-8">
        {experience.map((item, index) => (
          <div
            key={item.id || index}
            className="group flex gap-6"
          >
            {/* Timeline */}

            <div className="flex flex-col items-center">

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
                  group-hover:scale-105
                  group-hover:bg-cyan-500/20
                "
              >
                <TimelineIcon type={item.type} />
              </div>

              {index !== experience.length - 1 && (
                <div className="mt-3 h-full w-px bg-gradient-to-b from-cyan-500/40 to-transparent" />
              )}

            </div>

            {/* Card */}

            <div
              className="
                flex-1
                rounded-2xl
                border
                border-white/10
                bg-[#0B1220]
                p-6
                transition-all
                duration-300
                group-hover:-translate-y-1
                group-hover:border-cyan-400/30
              "
            >
              <div className="flex flex-wrap items-start justify-between gap-4">

                <div>

                  <div className="flex flex-wrap items-center gap-3">

                    <h3 className="text-xl font-semibold text-white">
                      {item.title}
                    </h3>

                    <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
                      {item.type}
                    </span>

                  </div>

                  <p className="mt-2 text-base font-medium text-slate-300">
                    {item.company}
                  </p>

                </div>

                <div className="flex items-center gap-2 text-sm text-slate-400">

                  <CalendarDays size={16} />

                  <span>{item.duration}</span>

                </div>

              </div>

              <p className="mt-5 leading-7 text-slate-400">
                {item.description}
              </p>

            </div>

          </div>
        ))}
             
      
 </div>

      <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">

        <p className="text-sm text-slate-500">
          Every project and milestone contributes to your developer journey.
        </p>

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
            duration-200
            hover:border-cyan-400/30
            hover:bg-cyan-500/10
          "
        >
          Add Experience
        </button>

      </div>

    </section>
  );
}