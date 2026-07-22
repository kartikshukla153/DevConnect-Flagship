import {
  FolderKanban,
  Users,
  MessageSquare,
  Bell,
} from "lucide-react";

import StatCard from "./StatCard";

const stats = [
  {
    title: "Projects",
    value: "12",
    icon: FolderKanban,
    change: "+2",
    subtitle: "active this week",
  },
  {
    title: "Connections",
    value: "154",
    icon: Users,
    change: "+18",
    subtitle: "new developers",
  },
  {
    title: "Messages",
    value: "42",
    icon: MessageSquare,
    change: "+5",
    subtitle: "unread messages",
  },
  {
    title: "Notifications",
    value: "9",
    icon: Bell,
    change: "+3",
    subtitle: "need attention",
  },
];

function StatsGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => (
        <StatCard
          key={item.title}
          title={item.title}
          value={item.value}
          icon={item.icon}
          change={item.change}
          subtitle={item.subtitle}
        />
      ))}
    </div>
  );
}

export default StatsGrid;