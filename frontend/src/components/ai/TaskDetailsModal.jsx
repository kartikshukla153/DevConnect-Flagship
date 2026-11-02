import { useState } from "react";
import { AlertCircle, CheckCircle2, Clock3, Code2, X } from "lucide-react";
import api from "../../api/axios";
import CodeGeneratorModal from "./CodeGeneratorModal";

const STATUS_OPTIONS = [
  { value: "todo", label: "To do" },
  { value: "in-progress", label: "In progress" },
  { value: "review", label: "In review" },
  { value: "completed", label: "Completed" },
];

export default function TaskDetailsModal({ task, onClose, refreshWorkspace }) {
  const [showCode, setShowCode] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [error, setError] = useState("");

  if (!task) return null;

  const updateStatus = async (status) => {
    if (status === task.status || savingStatus) return;

    setSavingStatus(true);
    setError("");

    try {
      await api.put(`/tasks/status/${task._id}`, { status });
      onClose();
      refreshWorkspace?.().catch(() => {});
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        "The task status could not be updated. Please try again."
      );
    } finally {
      setSavingStatus(false);
    }
  };

  const meta = [
    { label: "Priority", value: task.priority || "Medium" },
    { label: "Difficulty", value: task.difficulty || "Not set" },
    { label: "Estimate", value: `${task.estimatedHours ?? "—"} hours` },
    { label: "Story points", value: task.storyPoints ?? "—" },
  ];

  return (
    <>
      <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-6" onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}>
        <section role="dialog" aria-modal="true" aria-labelledby="task-dialog-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#101927] shadow-2xl shadow-black/50">
          <header className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-5 py-5 sm:px-7">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-400">Workspace task</p>
              <h2 id="task-dialog-title" className="mt-2 text-xl font-semibold tracking-tight text-white">{task.title}</h2>
            </div>
            <button type="button" onClick={onClose} aria-label="Close task details" className="rounded-lg p-2 text-slate-500 transition hover:bg-white/[0.06] hover:text-white"><X size={18} /></button>
          </header>

          <div className="space-y-6 px-5 py-6 sm:px-7">
            <div>
              <p className="text-xs font-medium text-slate-500">Description</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-300">{task.description || "No description provided."}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {meta.map((item) => (
                <div key={item.label} className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                  <p className="text-[10px] uppercase tracking-wide text-slate-600">{item.label}</p>
                  <p className="mt-1.5 text-sm font-medium capitalize text-slate-200">{item.value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-medium text-slate-400">Acceptance criteria</p>
              {task.acceptanceCriteria?.length ? (
                <ul className="mt-3 space-y-2">
                  {task.acceptanceCriteria.map((item, index) => (
                    <li key={`${index}-${item}`} className="flex gap-2 text-sm leading-6 text-slate-300">
                      <CheckCircle2 size={15} className="mt-1 shrink-0 text-emerald-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-600">No acceptance criteria defined.</p>
              )}
            </div>

            <div>
              <p className="mb-3 text-xs font-medium text-slate-400">Move task</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((status) => (
                  <button key={status.value} type="button" disabled={savingStatus || task.status === status.value} onClick={() => updateStatus(status.value)} className={`rounded-lg border px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-45 ${
                    task.status === status.value
                      ? "border-cyan-400/25 bg-cyan-400/10 text-cyan-200"
                      : "border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
                  }`}>
                    {status.label}
                  </button>
                ))}
              </div>
              {savingStatus && <p className="mt-2 flex items-center gap-2 text-xs text-slate-500"><Clock3 size={13} className="animate-pulse" /> Saving status…</p>}
              {error && <p role="alert" className="mt-3 flex items-start gap-2 text-xs text-rose-300"><AlertCircle size={14} className="mt-0.5 shrink-0" />{error}</p>}
            </div>

            <button type="button" onClick={() => setShowCode(true)} className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300">
              <Code2 size={15} /> Generate starter code
            </button>
          </div>
        </section>
      </div>

      {showCode && <CodeGeneratorModal task={task} onClose={() => setShowCode(false)} />}
    </>
  );
}
