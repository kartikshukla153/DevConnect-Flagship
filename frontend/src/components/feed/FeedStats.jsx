import {
  FolderGit2,
  Users,
  CheckCircle2,
  MessageCircle,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

const stats = [
  {
    title: "Projects",
    value: "12",
    change: "+3 this month",
    icon: FolderGit2,
    color: "from-cyan-500/20 to-sky-500/10",
    iconBg: "bg-cyan-500/15",
    iconColor: "text-cyan-400",
  },
  {
    title: "Connections",
    value: "84",
    change: "+18 this week",
    icon: Users,
    color: "from-violet-500/20 to-indigo-500/10",
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-400",
  },
  {
    title: "Completed Tasks",
    value: "29",
    change: "92% completed",
    icon: CheckCircle2,
    color: "from-emerald-500/20 to-green-500/10",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
  },
  {
    title: "Messages",
    value: "156",
    change: "+12 today",
    icon: MessageCircle,
    color: "from-orange-500/20 to-amber-500/10",
    iconBg: "bg-orange-500/15",
    iconColor: "text-orange-400",
  },
];

function FeedStats() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${item.color} bg-[#111827] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/10`}
          >
            {/* Glow */}

            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5 blur-3xl" />

            <div className="relative flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-400">
                  {item.title}
                </p>

                <h2 className="mt-3 text-4xl font-black tracking-tight text-white">
                  {item.value}
                </h2>

                <div className="mt-5 flex items-center gap-2">

                  <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1">

                    <TrendingUp
                      size={13}
                      className="text-emerald-400"
                    />

                    <span className="text-xs font-medium text-emerald-400">
                      {item.change}
                    </span>

                  </div>

                </div>

              </div>

              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl ${item.iconBg} transition-all duration-300 group-hover:scale-110`}
              >
                <Icon
                  size={30}
                  className={item.iconColor}
                />
              </div>

            </div>

            <div className="relative mt-8 flex items-center justify-between border-t border-white/10 pt-4">

              <span className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Live Stats
              </span>

              <ArrowUpRight
                size={18}
                className="text-slate-500 transition group-hover:text-cyan-400 group-hover:translate-x-1 group-hover:-translate-y-1"
              />

            </div>

          </div>
        );
      })}

    </div>
  );
}

export default FeedStats;