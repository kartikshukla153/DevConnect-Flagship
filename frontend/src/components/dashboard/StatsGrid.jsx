import {
  FolderKanban,
  Users,
  MessageSquare,
  Bell,
} from "lucide-react";

const stats = [
  {
    title: "Projects",
    value: "12",
    icon: FolderKanban,
  },
  {
    title: "Connections",
    value: "154",
    icon: Users,
  },
  {
    title: "Messages",
    value: "42",
    icon: MessageSquare,
  },
  {
    title: "Notifications",
    value: "9",
    icon: Bell,
  },
];

function StatsGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      {stats.map((item) => {

        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-3xl border border-white/10 bg-[#111827] p-7 transition hover:border-cyan-400 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">

              <div>

                <p className="text-gray-400">
                  {item.title}
                </p>

                <h2 className="mt-3 text-4xl font-bold">
                  {item.value}
                </h2>

              </div>

              <div className="rounded-2xl bg-cyan-500/10 p-4">

                <Icon
                  size={28}
                  className="text-cyan-400"
                />

              </div>

            </div>

          </div>
        );
      })}

    </div>
  );
}

export default StatsGrid;