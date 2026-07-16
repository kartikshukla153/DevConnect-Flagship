import { Bell, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

function Topbar() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const greeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B1220]/80 backdrop-blur-xl">

      <div className="flex h-20 items-center justify-between px-8">

        {/* Left */}

        <div>

          <h2 className="text-2xl font-bold text-white">
            {greeting()},
            {" "}
            <span className="text-cyan-400">
              {user.name || "Developer"}
            </span>
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Build. Collaborate. Ship.
          </p>

        </div>

        {/* Right */}

        <div className="flex items-center gap-5">

          {/* Search */}

          <div className="hidden items-center gap-3 rounded-xl border border-white/10 bg-[#111827] px-4 py-3 lg:flex">

            <Search
              size={18}
              className="text-gray-500"
            />

            <input
              placeholder="Search..."
              className="bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
            />

          </div>

          {/* AI */}

          <Link
            to="/ai"
            className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-cyan-300 transition hover:bg-cyan-500 hover:text-black"
          >
            <Sparkles size={18} />

            AI
          </Link>

          {/* Notifications */}

          <Link
            to="/notifications"
            className="rounded-xl border border-white/10 bg-[#111827] p-3 transition hover:border-cyan-400 hover:text-cyan-400"
          >
            <Bell size={20} />
          </Link>

          {/* Avatar */}

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-400 text-lg font-bold text-black shadow-lg shadow-cyan-500/20">
            {(user.name || "D")
              .charAt(0)
              .toUpperCase()}
          </div>

        </div>

      </div>

    </header>
  );
}

export default Topbar;