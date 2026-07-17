import {
  LayoutDashboard,
  CheckSquare,
  Users,
  MessageCircle,
  Bot,
} from "lucide-react";

const items = [
  {
    icon: LayoutDashboard,
    title: "Overview",
  },
  {
    icon: CheckSquare,
    title: "Tasks",
  },
  {
    icon: Users,
    title: "Team",
  },
  {
    icon: MessageCircle,
    title: "Chat",
  },
  {
    icon: Bot,
    title: "AI",
  },
];

function WorkspaceSidebar() {
  return (
    <aside className="rounded-3xl border border-[#263243] bg-[#111827] p-6">

      <h2 className="mb-8 text-xl font-bold">
        Workspace
      </h2>

      <div className="space-y-3">

        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              className="flex w-full items-center gap-4 rounded-xl p-4 text-left transition hover:bg-cyan-500/10 hover:text-cyan-300"
            >
              <Icon size={18} />
              {item.title}
            </button>
          );
        })}

      </div>

    </aside>
  );
}

export default WorkspaceSidebar;