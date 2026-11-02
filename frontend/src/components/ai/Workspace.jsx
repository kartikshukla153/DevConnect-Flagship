import { useCallback, useState } from "react";
import { AlertCircle, Bug, ShieldCheck } from "lucide-react";
import api from "../../api/axios";

import ProjectHeader from "./ProjectHeader";
import StatsCard from "./StatsCard";
import TechStack from "./TechStack";
import Timeline from "./Timeline";
import KanbanBoard from "./KanbanBoard";
import AIChat from "./AIChat";
import DocsPanel from "./DocsPanel";
import BugFixModal from "./BugFixModal";

function Workspace({ workspace, setWorkspace }) {
  const [showBugFix, setShowBugFix] = useState(false);
  const [refreshError, setRefreshError] = useState("");

  const projectId = workspace?.project?._id;

  const refreshWorkspace = useCallback(async () => {
    if (!projectId) return;

    try {
      const { data } = await api.get(`/ai/workspace/${projectId}`);
      setWorkspace(data);
      setRefreshError("");
      return data;
    } catch (error) {
      setRefreshError(
        error.response?.data?.message ||
        "Workspace could not be refreshed. Your current view has been preserved."
      );
      throw error;
    }
  }, [projectId, setWorkspace]);

  const allTasks = (workspace?.milestones || []).flatMap((milestone) =>
    Array.isArray(milestone.tasks) ? milestone.tasks : []
  );

  const updateTasks = useCallback((nextTasks) => {
    setWorkspace((current) => {
      if (!current) return current;

      const taskMap = new Map(nextTasks.map((task) => [String(task._id), task]));
      const milestones = current.milestones.map((milestone) => ({
        ...milestone,
        tasks: milestone.tasks.map((task) => taskMap.get(String(task._id)) || task),
      }));

      const completed = nextTasks.filter((task) => task.status === "completed").length;
      const inProgress = nextTasks.filter((task) => task.status === "in-progress").length;
      const review = nextTasks.filter((task) => task.status === "review").length;

      return {
        ...current,
        milestones,
        stats: {
          ...current.stats,
          totalTasks: nextTasks.length,
          completed,
          inProgress,
          review,
          todo: nextTasks.length - completed - inProgress - review,
          progress: nextTasks.length ? Math.round((completed / nextTasks.length) * 100) : 0,
        },
      };
    });
  }, [setWorkspace]);

  if (!workspace?.project) return null;

  return (
    <div className="mt-8 space-y-10">
      <ProjectHeader project={workspace.project} />

      {refreshError && (
        <div role="status" className="flex items-start gap-2 rounded-xl border border-amber-300/15 bg-amber-300/[0.05] px-4 py-3 text-xs text-amber-200">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{refreshError}</span>
          <button type="button" onClick={() => refreshWorkspace().catch(() => {})} className="ml-auto shrink-0 underline underline-offset-2">Retry</button>
        </div>
      )}

      <section aria-label="Project progress" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Progress" value={`${workspace.stats?.progress ?? 0}%`} color="#22c55e" />
        <StatsCard title="Total tasks" value={workspace.stats?.totalTasks ?? allTasks.length} color="#60a5fa" />
        <StatsCard title="In progress" value={workspace.stats?.inProgress ?? 0} color="#a78bfa" />
        <StatsCard title="Completed" value={workspace.stats?.completed ?? 0} color="#f59e0b" />
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-400">Technical foundation</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Technology stack</h2>
          </div>
          <span className="text-xs text-slate-500">{workspace.techStack?.length || 0} technologies</span>
        </div>
        <TechStack techStack={workspace.techStack || []} />
      </section>

      <Timeline milestones={workspace.milestones || []} />

      <section>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-400">Execution</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Task board</h2>
            <p className="mt-1 text-xs text-slate-500">Move work through the delivery workflow. Changes save to the project.</p>
          </div>
          <span className="text-xs text-slate-500">{allTasks.length} tracked tasks</span>
        </div>
        <KanbanBoard
          tasks={allTasks}
          onTasksChange={updateTasks}
          refreshWorkspace={refreshWorkspace}
        />
      </section>

      <section className="rounded-2xl border border-white/[0.07] bg-[#0E1624] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-300/15 bg-amber-300/[0.07] text-amber-200"><Bug size={18} /></div>
            <div>
              <h2 className="text-sm font-semibold text-white">AI debugging assistant</h2>
              <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">Analyze a code snippet, understand the likely defects and review a suggested correction.</p>
            </div>
          </div>
          <button type="button" onClick={() => setShowBugFix(true)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-amber-300/20 bg-amber-300/[0.08] px-4 py-2.5 text-xs font-semibold text-amber-100 transition hover:border-amber-300/35 hover:bg-amber-300/[0.12]">
            <ShieldCheck size={15} /> Open bug fixer
          </button>
        </div>
      </section>

      <DocsPanel projectId={projectId} />
      <AIChat projectId={projectId} />

      {showBugFix && <BugFixModal onClose={() => setShowBugFix(false)} />}
    </div>
  );
}

export default Workspace;
