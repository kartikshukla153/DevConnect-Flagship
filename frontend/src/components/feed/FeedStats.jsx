import { CheckCircle2, FolderKanban, MessageCircle, Bell } from "lucide-react";

function Metric({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-2xl border border-white/[0.065] bg-[#0F172A] px-4 py-4 shadow-[0_8px_30px_rgba(0,0,0,.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">{label}</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-white">{value}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.05] bg-white/[0.025]">
          <Icon size={16} className="text-cyan-300" />
        </div>
      </div>
      <p className="mt-2 text-[10px] text-slate-600">{hint}</p>
    </div>
  );
}

export default function FeedStats({ projects = 0, completedTasks = 0, conversations = 0, unreadNotifications = 0 }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric icon={FolderKanban} label="Projects" value={projects} hint="Projects in your workspace" />
      <Metric icon={CheckCircle2} label="Completed tasks" value={completedTasks} hint="Tasks completed across projects" />
      <Metric icon={MessageCircle} label="Conversations" value={conversations} hint="Active conversations" />
      <Metric icon={Bell} label="Notifications" value={unreadNotifications} hint="Unread notifications" />
    </div>
  );
}
