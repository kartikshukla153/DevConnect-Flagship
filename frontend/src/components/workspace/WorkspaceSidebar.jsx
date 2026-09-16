import { Bot, CheckSquare, LayoutDashboard, MessageCircle, Plus, Users } from "lucide-react";

function WorkspaceSidebar({ taskCount = 0, activeSection = "tasks", onCreateTask, onInvite, onOpenAI }) {
  const items = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "tasks", label: "Tasks", icon: CheckSquare, badge: taskCount },
    { key: "team", label: "Team", icon: Users },
    { key: "chat", label: "Project chat", icon: MessageCircle },
    { key: "ai", label: "AI workspace", icon: Bot },
  ];

  return (
    <aside className="rounded-2xl border border-white/10 bg-[#111827] p-3 xl:sticky xl:top-5">
      <div className="px-3 pb-3 pt-2">
        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-cyan-400">Workspace</p>
        <p className="mt-1 text-sm text-slate-500">Navigate the project</p>
      </div>

      <nav className="space-y-1">
        {items.map(({ key, label, icon: Icon, badge }) => {
          const active = activeSection === key;
          const action = key === "ai" ? onOpenAI : undefined;
          return (
            <button key={key} onClick={action} className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm transition ${active ? "bg-cyan-500/10 text-cyan-200" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
              <span className="flex items-center gap-3"><Icon size={17} /> {label}</span>
              {badge !== undefined && <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-500">{badge}</span>}
            </button>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-white/5 pt-4">
        <button onClick={onCreateTask} className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-3 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300"><Plus size={16} /> New task</button>
        <button onClick={onInvite} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-300 hover:bg-white/10"><Users size={16} /> Invite member</button>
      </div>
    </aside>
  );
}

export default WorkspaceSidebar;
