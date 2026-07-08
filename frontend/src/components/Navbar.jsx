import { Link, useNavigate } from "react-router-dom";
import NotificationBell from "./notifications/NotificationBell";

function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0B1020]/90 backdrop-blur-lg border-b border-white/10">

      <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">

        <Link
          to="/feed"
          className="text-2xl font-bold text-cyan-400"
        >
          DevConnect
        </Link>

        <div className="flex items-center gap-6">

          <Link
            to="/feed"
            className="hover:text-cyan-400 transition"
          >
            Feed
          </Link>

          <Link
            to="/developers"
            className="hover:text-cyan-400 transition"
          >
            Developers
          </Link>

          <Link
            to="/messages"
            className="hover:text-cyan-400 transition"
          >
            Messages
          </Link>

          <Link
            to="/profile"
            className="hover:text-cyan-400 transition"
          >
            Profile
          </Link>

          <Link
            to="/notifications"
          >
            <NotificationBell />
          </Link>

          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold"
          >
            Logout
          </button>

        </div>

      </div>

    </nav>
  );
}

export default Navbar;