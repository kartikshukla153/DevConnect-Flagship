import { useEffect, useState } from "react";
import { Bell, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

function Topbar() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const greeting = () => {
    const hour = currentTime.getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B1220]/80 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between px-6 lg:px-8">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold tracking-[-0.02em] text-white">
            {greeting()},{" "}
            <span className="text-cyan-400">
              {user.name || "Developer"}
            </span>
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Build. Collaborate. Ship.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/ai"
            className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-cyan-300 transition hover:border-cyan-400/40 hover:bg-cyan-500 hover:text-black"
            aria-label="Open AI Architect"
          >
            <Sparkles size={18} />
            <span className="hidden sm:inline">AI</span>
          </Link>

          <Link
            to="/notifications"
            className="rounded-xl border border-white/10 bg-[#111827] p-3 text-gray-300 transition hover:border-cyan-400/30 hover:text-cyan-400"
            aria-label="Notifications"
          >
            <Bell size={20} />
          </Link>

          <Link
            to="/profile"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-400 text-lg font-bold text-black shadow-lg shadow-cyan-500/20 transition hover:scale-[1.03]"
            aria-label="Open profile"
          >
            {(user.name || "D").charAt(0).toUpperCase()}
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Topbar;