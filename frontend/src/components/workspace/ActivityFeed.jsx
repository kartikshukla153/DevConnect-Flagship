import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";
import { Activity, CheckCircle2, Clock3, GitBranch, MessageSquare, RefreshCw, Trash2, UserPlus } from "lucide-react";

const ICONS = {
  task_created: Activity,
  task_assigned: UserPlus,
  task_status_updated: Clock3,
  task_completed: CheckCircle2,
  task_submission_approved: CheckCircle2,
  task_submission_rejected: Clock3,
  task_reviewed: Activity,
  comment_added: MessageSquare,
  github_connected: GitBranch,
  github_pr_linked: GitBranch,
  task_deleted: Trash2,
};

function ActivityFeed({ projectId, refreshKey = 0 }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!projectId) return;
    try {
      if (silent) setRefreshing(true); else setLoading(true);
      setError("");
      const response = await api.get(`/projects/activity/${projectId}`);
      setActivities(Array.isArray(response.data?.activities) ? response.data.activities : []);
    } catch (err) {
      setError(err.response?.data?.message || "Activity unavailable");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (refreshKey) load({ silent: true }); }, [refreshKey, load]);

  return (
    <section className="rounded-2xl border border-white/10 bg-[#111827] p-5">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-cyan-400">Timeline</p><h2 className="mt-1 text-lg font-semibold text-white">Recent activity</h2></div>
        <button onClick={() => load({ silent: true })} disabled={refreshing} className="rounded-lg border border-white/10 p-2 text-slate-500 hover:bg-white/5 hover:text-white disabled:opacity-50"><RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /></button>
      </div>

      {loading ? <div className="mt-5 space-y-3">{[1,2,3].map((n) => <div key={n} className="h-14 animate-pulse rounded-xl bg-white/5" />)}</div> : error ? <div className="mt-5 rounded-xl border border-amber-500/10 bg-amber-500/5 p-4 text-xs text-amber-200">{error}</div> : activities.length === 0 ? <div className="mt-5 rounded-xl bg-[#0B1220] p-5 text-center text-xs text-slate-600">No activity recorded yet.</div> : <div className="mt-5 space-y-2">{activities.slice(0, 8).map((item) => { const Icon = ICONS[item.type] || Activity; return <div key={item._id || `${item.type}-${item.createdAt}`} className="flex gap-3 rounded-xl border border-white/5 bg-[#0B1220] p-3"><div className="mt-0.5 rounded-lg bg-white/5 p-2 text-cyan-400"><Icon size={14} /></div><div className="min-w-0 flex-1"><p className="text-xs leading-5 text-slate-300">{item.message}</p><p className="mt-1 text-[10px] text-slate-600">{item.createdAt ? new Date(item.createdAt).toLocaleString() : "Recently"}</p></div></div>; })}</div>}
    </section>
  );
}

export default ActivityFeed;
