import { FolderGit2, Users, CheckCircle, MessageCircle } from "lucide-react";

const stats = [
  {
    title: "Projects",
    value: "12",
    icon: FolderGit2,
  },
  {
    title: "Connections",
    value: "84",
    icon: Users,
  },
  {
    title: "Tasks",
    value: "29",
    icon: CheckCircle,
  },
  {
    title: "Messages",
    value: "156",
    icon: MessageCircle,
  },
];

function FeedStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-2xl bg-[#111827] border border-[#374151] p-5 hover:border-cyan-500 transition"
          >
            <Icon className="text-cyan-400 mb-4" />

            <p className="text-gray-400 text-sm">
              {item.title}
            </p>

            <h2 className="text-3xl font-bold mt-1">
              {item.value}
            </h2>
          </div>
        );
      })}
    </div>
  );
}

export default FeedStats;