import {
  Brain,
  Clock3,
  Users,
  Sparkles,
} from "lucide-react";

function WorkspaceRightSidebar() {
  return (
    <div className="space-y-6">

      <div className="rounded-3xl border border-[#263243] bg-[#111827] p-6">

        <Brain className="mb-4 text-cyan-400" />

        <h2 className="font-semibold">
          AI Suggestions
        </h2>

        <p className="mt-3 text-sm leading-7 text-gray-400">
          AI architecture reviews, debugging, documentation and sprint planning
          will appear here.
        </p>

      </div>

      <div className="rounded-3xl border border-[#263243] bg-[#111827] p-6">

        <Users className="mb-4 text-cyan-400" />

        <h2 className="font-semibold">
          Team Activity
        </h2>

        <p className="mt-3 text-sm text-gray-400">
          Live member activity coming next.
        </p>

      </div>

      <div className="rounded-3xl border border-[#263243] bg-[#111827] p-6">

        <Clock3 className="mb-4 text-cyan-400" />

        <h2 className="font-semibold">
          Sprint
        </h2>

        <p className="mt-3 text-sm text-gray-400">
          12 days remaining.
        </p>

      </div>

      <button className="flex w-full items-center justify-center gap-3 rounded-2xl bg-cyan-400 py-4 font-semibold text-black hover:bg-cyan-300">

        <Sparkles size={20} />

        Open AI Architect

      </button>

    </div>
  );
}

export default WorkspaceRightSidebar;