import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Users,
  Search,
  MessageCircle,
  ExternalLink,
  UserMinus,
  MapPin,
  Circle,
  RefreshCw,
  UserRound,
  X,
} from "lucide-react";

const API = "http://localhost:5000/api";

function Connections() {
  const token = localStorage.getItem("token");

  const [connections, setConnections] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState("");

  const fetchConnections = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API}/connections/my-connections`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setConnections(response.data.connections || []);
    } catch (err) {
      console.error("Connections Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your connections."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const filteredConnections = useMemo(() => {
    const query = search.trim().toLowerCase();

    return connections.filter((connection) => {
      const name = connection.name?.toLowerCase() || "";
      const email = connection.email?.toLowerCase() || "";
      const bio = connection.bio?.toLowerCase() || "";
      const location = connection.location?.toLowerCase() || "";

      const skills = Array.isArray(connection.skills)
        ? connection.skills.join(" ").toLowerCase()
        : "";

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query) ||
        bio.includes(query) ||
        location.includes(query) ||
        skills.includes(query);

      const matchesFilter =
        filter === "all" ||
        (filter === "online" && connection.isOnline) ||
        (filter === "offline" && !connection.isOnline);

      return matchesSearch && matchesFilter;
    });
  }, [connections, search, filter]);

  const onlineCount = connections.filter(
    (connection) => connection.isOnline
  ).length;

  const removeConnection = async (connectionId, name) => {
    const confirmed = window.confirm(
      `Remove ${name} from your connections?`
    );

    if (!confirmed) return;

    try {
      setRemovingId(connectionId);

      await axios.delete(
        `${API}/connections/remove/${connectionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setConnections((previous) =>
        previous.filter(
          (connection) => connection._id !== connectionId
        )
      );
    } catch (err) {
      console.error("Remove Connection Error:", err);

      alert(
        err.response?.data?.message ||
          "Failed to remove connection."
      );
    } finally {
      setRemovingId(null);
    }
  };

  const getInitial = (name) => {
    return name?.charAt(0)?.toUpperCase() || "?";
  };

  const clearSearch = () => {
    setSearch("");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <div className="h-10 w-64 animate-pulse rounded-xl bg-[#111827]" />
          <div className="mt-4 h-5 w-96 animate-pulse rounded-lg bg-[#111827]" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="h-[360px] animate-pulse rounded-3xl border border-[#263243] bg-[#111827]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
              <Users size={22} className="text-cyan-400" />
            </div>

            <span className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
              Network
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            My Connections
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-gray-400">
            Manage your developer network, discover active
            collaborators and jump directly into conversations.
          </p>
        </div>

        <button
          onClick={fetchConnections}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-[#263243] bg-[#111827] px-4 py-3 text-sm font-medium text-gray-300 transition hover:border-cyan-400/50 hover:text-cyan-300 lg:self-auto"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Network Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#263243] bg-[#111827] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              Total Connections
            </span>

            <Users size={18} className="text-cyan-400" />
          </div>

          <div className="mt-3 text-3xl font-bold text-white">
            {connections.length}
          </div>
        </div>

        <div className="rounded-2xl border border-[#263243] bg-[#111827] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              Online Now
            </span>

            <Circle
              size={14}
              fill="currentColor"
              className="text-green-400"
            />
          </div>

          <div className="mt-3 text-3xl font-bold text-white">
            {onlineCount}
          </div>
        </div>

        <div className="rounded-2xl border border-[#263243] bg-[#111827] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              Showing
            </span>

            <UserRound size={18} className="text-cyan-400" />
          </div>

          <div className="mt-3 text-3xl font-bold text-white">
            {filteredConnections.length}
          </div>
        </div>
      </div>

      {/* Search / Filters */}
      <div className="mb-8 rounded-3xl border border-[#263243] bg-[#111827] p-4 md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, skill, location or bio..."
              className="w-full rounded-2xl border border-[#263243] bg-[#0B1220] py-3.5 pl-12 pr-12 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400/60"
            />

            {search && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-white"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <div className="flex rounded-2xl border border-[#263243] bg-[#0B1220] p-1">
            {[
              ["all", "All"],
              ["online", "Online"],
              ["offline", "Offline"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`rounded-xl px-5 py-2.5 text-sm font-medium transition ${
                  filter === value
                    ? "bg-cyan-400 text-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-8 rounded-2xl border border-red-400/20 bg-red-400/5 p-5">
          <p className="text-sm text-red-300">{error}</p>

          <button
            onClick={fetchConnections}
            className="mt-3 text-sm font-medium text-red-200 underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty Network */}
      {!error && connections.length === 0 && (
        <div className="rounded-3xl border border-dashed border-[#334155] bg-[#111827] px-6 py-24 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10">
            <Users size={30} className="text-cyan-400" />
          </div>

          <h2 className="mt-6 text-2xl font-bold text-white">
            Your network is empty
          </h2>

          <p className="mx-auto mt-3 max-w-md text-gray-400">
            Start connecting with developers and build your
            professional network inside DevConnect.
          </p>

          <Link
            to="/developers"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-black transition hover:bg-cyan-300"
          >
            <Users size={18} />
            Discover Developers
          </Link>
        </div>
      )}

      {/* No Search Results */}
      {!error &&
        connections.length > 0 &&
        filteredConnections.length === 0 && (
          <div className="rounded-3xl border border-[#263243] bg-[#111827] px-6 py-20 text-center">
            <Search
              size={38}
              className="mx-auto text-gray-600"
            />

            <h2 className="mt-5 text-xl font-semibold text-white">
              No connections found
            </h2>

            <p className="mt-2 text-gray-400">
              Try a different name, skill, location or filter.
            </p>
          </div>
        )}

      {/* Connection Grid */}
      {!error && filteredConnections.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredConnections.map((connection) => {
            const isRemoving =
              removingId === connection._id;

            return (
              <div
                key={connection._id}
                className="group overflow-hidden rounded-3xl border border-[#263243] bg-[#111827] transition duration-300 hover:-translate-y-1 hover:border-cyan-400/50 hover:shadow-[0_20px_50px_rgba(0,0,0,.25)]"
              >
                {/* Banner */}
                <div className="h-24 bg-gradient-to-r from-cyan-500/25 via-cyan-400/10 to-transparent" />

                <div className="px-6 pb-6">
                  {/* Avatar */}
                  <div className="-mt-10 flex items-end justify-between">
                    <div className="relative">
                      {connection.profilePicture ? (
                        <img
                          src={connection.profilePicture}
                          alt={connection.name}
                          className="h-20 w-20 rounded-full border-4 border-[#111827] object-cover"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#111827] bg-cyan-400 text-3xl font-bold text-black">
                          {getInitial(connection.name)}
                        </div>
                      )}

                      <span
                        className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-[#111827] ${
                          connection.isOnline
                            ? "bg-green-400"
                            : "bg-gray-500"
                        }`}
                      />
                    </div>

                    <span
                      className={`mb-1 flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
                        connection.isOnline
                          ? "border-green-400/20 bg-green-400/10 text-green-400"
                          : "border-gray-500/20 bg-gray-500/10 text-gray-400"
                      }`}
                    >
                      <Circle
                        size={8}
                        fill="currentColor"
                      />

                      {connection.isOnline
                        ? "Online"
                        : "Offline"}
                    </span>
                  </div>

                  {/* Identity */}
                  <div className="mt-5">
                    <h2 className="text-xl font-bold text-white">
                      {connection.name}
                    </h2>

                    {connection.email && (
                      <p className="mt-1 truncate text-sm text-cyan-400">
                        {connection.email}
                      </p>
                    )}

                    {connection.location && (
                      <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                        <MapPin size={15} />
                        {connection.location}
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  <p className="mt-5 min-h-[48px] text-sm leading-6 text-gray-400">
                    {connection.bio ||
                      "Developer on the DevConnect network."}
                  </p>

                  {/* Skills */}
                  {connection.skills?.length > 0 && (
                    <div className="mt-5 flex min-h-[32px] flex-wrap gap-2">
                      {connection.skills
                        .slice(0, 5)
                        .map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300"
                          >
                            {skill}
                          </span>
                        ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-7 grid grid-cols-2 gap-3">
                    <Link
                      to={`/developers/${connection._id}`}
                      className="flex items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300"
                    >
                      <ExternalLink size={16} />
                      Profile
                    </Link>

                    <Link
                      to={`/messages?userId=${connection._id}`}
                      className="flex items-center justify-center gap-2 rounded-xl border border-[#334155] bg-[#0B1220] py-3 text-sm font-medium text-gray-200 transition hover:border-cyan-400/50 hover:text-cyan-300"
                    >
                      <MessageCircle size={16} />
                      Message
                    </Link>
                  </div>

                  <button
                    onClick={() =>
                      removeConnection(
                        connection._id,
                        connection.name
                      )
                    }
                    disabled={isRemoving}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/10 py-2.5 text-xs font-medium text-gray-500 transition hover:border-red-400/30 hover:bg-red-400/5 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <UserMinus size={15} />

                    {isRemoving
                      ? "Removing..."
                      : "Remove Connection"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Connections;