import { useState } from "react";
import { ArrowUpRight, GripVertical } from "lucide-react";
import TaskDetailsModal from "./TaskDetailsModal";

const STATUS_LABELS = {
  todo: "To do",
  "in-progress": "In progress",
  review: "In review",
  completed: "Completed",
};

const PRIORITY_STYLES = {
  low: "text-slate-500",
  medium: "text-blue-300",
  high: "text-amber-300",
  urgent: "text-rose-300",
};

export default function TaskCard({ task, refreshWorkspace }) {
  const [open, setOpen] = useState(false);
  const priority = String(task.priority || "medium").toLowerCase();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Open task: ${task.title}`}
        className="group w-full rounded-lg border border-white/[0.07] bg-[#151F2E] p-3.5 text-left transition duration-150 hover:-translate-y-0.5 hover:border-cyan-300/20 hover:bg-[#192638] hover:shadow-lg hover:shadow-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50"
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-xs font-semibold leading-5 text-slate-100">{task.title}</h4>
          <span className="mt-0.5 flex shrink-0 items-center gap-1 text-slate-700 transition group-hover:text-cyan-300">
            <GripVertical size={13} />
            <ArrowUpRight size={12} />
          </span>
        </div>
        {task.description && <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-slate-500">{task.description}</p>}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/[0.05] pt-2.5">
          <span className={`text-[10px] font-medium capitalize ${PRIORITY_STYLES[priority] || PRIORITY_STYLES.medium}`}>{priority} priority</span>
          <span className="text-[10px] text-slate-600">{STATUS_LABELS[task.status] || task.status}</span>
        </div>
      </button>

      <TaskDetailsModal
        task={open ? task : null}
        onClose={() => setOpen(false)}
        refreshWorkspace={refreshWorkspace}
      />
    </>
  );
}
