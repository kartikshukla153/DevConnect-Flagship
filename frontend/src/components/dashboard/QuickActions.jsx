import {
  FolderKanban,
  SquarePen,
  Users,
  MessageSquare,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import { Link } from "react-router-dom";

const actions = [
  {
    title: "Create Project",
    description: "Start collaborating with developers.",
    icon: FolderKanban,
    to: "/projects",
  },
  {
    title: "Create Post",
    description: "Share your progress with the community.",
    icon: SquarePen,
    to: "/feed",
  },
  {
    title: "Discover Developers",
    description: "Find teammates for your next project.",
    icon: Users,
    to: "/developers",
  },
  {
    title: "Messages",
    description: "Continue your recent conversations.",
    icon: MessageSquare,
    to: "/messages",
  },
  {
    title: "AI Architect",
    description: "Plan scalable software systems using AI.",
    icon: Sparkles,
    to: "/ai",
  },
];

function QuickActions() {
  return (
    <section className="rounded-3xl border border-[#263243] bg-[#111827] p-8">

      <div className="mb-8">

        <h2 className="text-2xl font-bold text-white">
          Quick Actions
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          Jump directly into the most important parts of your workspace.
        </p>

      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">

        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              to={action.to}
              className="group flex items-center justify-between rounded-2xl border border-[#263243] bg-[#0B1220] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500 hover:shadow-xl hover:shadow-cyan-500/10"
            >
              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 transition group-hover:bg-cyan-500 group-hover:text-black">

                  <Icon size={24} className="text-cyan-400 group-hover:text-black" />

                </div>

                <div>

                  <h3 className="font-semibold text-white">
                    {action.title}
                  </h3>

                  <p className="mt-1 text-sm text-gray-400">
                    {action.description}
                  </p>

                </div>

              </div>

              <ArrowRight
                size={20}
                className="text-gray-500 transition group-hover:translate-x-1 group-hover:text-cyan-400"
              />

            </Link>
          );
        })}

      </div>

    </section>
  );
}

export default QuickActions;