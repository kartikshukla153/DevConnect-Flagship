import { CalendarDays, Clock3, Flag, MessageSquare } from "lucide-react";

function priorityMeta(priority) {
  switch ((priority || "medium").toLowerCase()) {
    case "urgent": return { label: "Urgent", cls: "border-red-500/20 bg-red-500/10 text-red-300", dot: "bg-red-400" };
    case "high": return { label: "High", cls: "border-orange-500/20 bg-orange-500/10 text-orange-300", dot: "bg-orange-400" };
    case "low": return { label: "Low", cls: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300", dot: "bg-emerald-400" };
    default: return { label: "Medium", cls: "border-amber-500/20 bg-amber-500/10 text-amber-300", dot: "bg-amber-400" };
  }
}

function deadlineMeta(deadline) {
  if (!deadline) return { label: "No deadline", cls: "text-slate-600" };
  const due = new Date(deadline);
  if (Number.isNaN(due.getTime())) return { label: "Invalid deadline", cls: "text-slate-600" };
  const diff = due.getTime() - Date.now();
  if (diff < 0) return { label: "Overdue", cls: "text-red-300" };
  const days = Math.ceil(diff / 86400000);
  if (days <= 1) return { label: "Due today", cls: "text-amber-300" };
  return { label: `${days}d left`, cls: "text-cyan-300" };
}

function TaskCard({ task, onClick, busy = false }) {
  const priority = priorityMeta(task.priority);
  const deadline = deadlineMeta(task.deadline);
  const initials = task.assignedTo?.name?.trim()?.slice(0, 1)?.toUpperCase() || "?";
  const labels = Array.isArray(task.labels) ? task.labels.slice(0, 3) : [];

  return (
    <article onClick={() => !busy && onClick?.(task)} role="button" tabIndex={0} onKeyDown={(e) => { if (!busy && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onClick?.(task); } }} className={`group rounded-xl border border-white/10 bg-[#111827] p-4 transition hover:border-cyan-400/20 hover:bg-[#141d2d] focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${busy ? "opacity-60" : "cursor-pointer"}`}>
      <div className="flex items-start justify-between gap-3">
        <h4 className="line-clamp-2 text-sm font-semibold leading-5 text-white">{task.title || "Untitled task"}</h4>
        <Flag size={14} className={priority.label === "Urgent" ? "shrink-0 text-red-400" : "shrink-0 text-slate-600"} />
      </div>

      {task.description && <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{task.description}</p>}

      {labels.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{labels.map((label) => <span key={label} className="rounded-md border border-white/5 bg-white/5 px-2 py-1 text-[10px] text-slate-400">{label}</span>)}</div>}

      <div className="mt-4 flex items-center justify-between gap-2">
        <span className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${priority.cls}`}><span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} />{priority.label}</span>
        <span className="flex items-center gap-1 text-[10px] text-slate-600"><Clock3 size={12} /> {task.estimatedHours ?? "—"}h</span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-[10px] font-bold text-slate-950">{initials}</div>
          <span className="truncate text-[11px] text-slate-400">{task.assignedTo?.name || "Unassigned"}</span>
        </div>
        <div className={`flex items-center gap-1 text-[10px] ${deadline.cls}`}><CalendarDays size={12} /> {deadline.label}</div>
      </div>

      {(task.comments?.length > 0 || task.submission?.status) && <div className="mt-3 flex items-center justify-between text-[10px] text-slate-600"><span className="flex items-center gap-1"><MessageSquare size={12} /> {task.comments?.length || 0}</span>{task.submission?.status && <span className="capitalize">{task.submission.status.replace("_", " ")}</span>}</div>}
    </article>
  );
}

export default TaskCard;
