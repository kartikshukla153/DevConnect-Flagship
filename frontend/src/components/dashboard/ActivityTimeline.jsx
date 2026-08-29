import {
  Activity,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import ActivityItem from "./ActivityItem";
import { useNavigate } from "react-router-dom";

function ActivityTimeline({ activities = [] }) {
  const navigate = useNavigate();

  return (
    <section className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#111827] p-6 shadow-[0_16px_60px_rgba(0,0,0,0.14)] sm:p-8">
      <div className="mb-7 flex items-start justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.7)]" />

            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Recent Activity
            </h2>
          </div>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            A live stream of your projects, tasks, connections,
            posts and collaboration activity.
          </p>
        </div>

        {activities.length > 0 && (
          <button className="hidden items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-cyan-400 sm:flex">
            View all
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-white/10 bg-[#0B1220] px-6 py-16 text-center">
          <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full bg-cyan-400/[0.05] blur-3xl" />

          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.07]">
            <Activity
              size={27}
              className="text-cyan-400"
            />
          </div>

          <h3 className="relative mt-5 text-lg font-bold text-white">
            Your activity stream starts here
          </h3>

          <p className="relative mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Create a project, publish something, connect with a
            developer or complete a task and your workspace will
            start building your engineering timeline.
          </p>

          <div className="relative mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate("/projects/create")}
              className="inline-flex items-center gap-2 rounded-xl bg-white/[0.05] px-4 py-2.5 text-xs font-bold text-slate-200 transition-all hover:bg-cyan-400/[0.08] hover:text-cyan-300"
            >
              <Sparkles size={14} />
              Start building
            </button>

            <button
              onClick={() => navigate("/feed")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-500 transition-all hover:border-white/20 hover:text-slate-300"
            >
              Open Feed
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-7">
          {activities.map((activity, index) => (
            <ActivityItem
              key={activity._id || index}
              activity={activity}
              isLast={index === activities.length - 1}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default ActivityTimeline;