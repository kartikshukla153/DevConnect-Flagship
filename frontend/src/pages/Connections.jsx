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
  Check,
  AlertCircle,
  Clock3,
  Sparkles,
  ArrowUpRight,
  SlidersHorizontal,
} from "lucide-react";

const API =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5000/api";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
];

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) return "?";

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return "Offline";

  const timestamp = new Date(lastSeen).getTime();

  if (Number.isNaN(timestamp)) return "Offline";

  const diff = Date.now() - timestamp;

  if (diff < 60_000) return "Last seen just now";

  const minutes = Math.floor(diff / 60_000);

  if (minutes < 60) {
    return `Last seen ${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `Last seen ${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `Last seen ${days}d ago`;
  }

  return `Last seen ${new Date(timestamp).toLocaleDateString([], {
    day: "numeric",
    month: "short",
  })}`;
};

function PageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse">
      <div className="mb-8">
        <div className="h-4 w-28 rounded bg-[#1a2433]" />
        <div className="mt-4 h-12 w-80 rounded-xl bg-[#1a2433]" />
        <div className="mt-4 h-5 w-full max-w-2xl rounded bg-[#1a2433]" />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-28 rounded-2xl border border-[#263243] bg-[#111827]"
          />
        ))}
      </div>

      <div className="mb-8 h-20 rounded-3xl border border-[#263243] bg-[#111827]" />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="h-[390px] rounded-3xl border border-[#263243] bg-[#111827]"
          />
        ))}
      </div>
    </div>
  );
}

function EmptyNetwork() {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[#263243] bg-[#111827] px-6 py-24 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.09),transparent_45%)]" />

      <div className="relative">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10 shadow-[0_0_50px_rgba(34,211,238,0.08)]">
          <Users size={34} className="text-cyan-300" />
        </div>

        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">
          Build your network
        </p>

        <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
          Your developer network starts here.
        </h2>

        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-gray-400">
          Connect with developers, find collaborators and turn conversations
          into real projects inside DevConnect.
        </p>

        <Link
          to="/developers"
          className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-[#061018] shadow-[0_8px_30px_rgba(34,211,238,0.12)] transition hover:bg-cyan-300 hover:shadow-[0_10px_35px_rgba(34,211,238,0.18)]"
        >
          Discover Developers
          <ArrowUpRight
            size={17}
            className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </div>
  );
}

function ConnectionCard({ connection, onRemove, removingId }) {
  const isOnline = Boolean(connection?.isOnline);
  const isRemoving = removingId === connection?._id;

  const name = connection?.name || "Unknown Developer";
  const email = connection?.email || "";
  const bio =
    connection?.bio?.trim() ||
    "Developer on the DevConnect network.";

  const skills = Array.isArray(connection?.skills)
    ? connection.skills.filter(Boolean)
    : [];

  return (
    <article className="group relative overflow-hidden rounded-[26px] border border-[#263243] bg-[#111827] transition duration-300 hover:-translate-y-1 hover:border-cyan-400/35 hover:shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
      {/* Accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-0 transition group-hover:opacity-100" />

      {/* Header / Banner */}
      <div className="relative h-[108px] overflow-hidden border-b border-white/[0.03] bg-[#0d1624]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.18),transparent_38%),radial-gradient(circle_at_90%_100%,rgba(34,211,238,0.06),transparent_45%)]" />

        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent" />

        <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full border border-white/[0.06] bg-black/20 px-2.5 py-1.5 backdrop-blur">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isOnline ? "bg-emerald-400" : "bg-slate-500"
            }`}
          />

          <span
            className={`text-[11px] font-medium ${
              isOnline ? "text-emerald-300" : "text-slate-400"
            }`}
          >
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      <div className="relative px-5 pb-5 sm:px-6">
        {/* Avatar */}
        <div className="-mt-11 flex items-end justify-between">
          <Link
            to={`/developers/${connection?._id}`}
            className="relative block rounded-full outline-none ring-cyan-400/40 transition focus-visible:ring-4"
            aria-label={`Open ${name}'s profile`}
          >
            {connection?.profilePicture ? (
              <img
                src={connection.profilePicture}
                alt={name}
                className="h-[82px] w-[82px] rounded-full border-[5px] border-[#111827] bg-[#0b1220] object-cover shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
              />
            ) : (
              <div className="flex h-[82px] w-[82px] items-center justify-center rounded-full border-[5px] border-[#111827] bg-gradient-to-br from-cyan-300 to-cyan-500 text-xl font-bold text-[#061018] shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
                {getInitials(name)}
              </div>
            )}

            <span
              className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-[3px] border-[#111827] ${
                isOnline ? "bg-emerald-400" : "bg-slate-500"
              }`}
            />
          </Link>

          <span className="mb-1 inline-flex items-center gap-1.5 text-[11px] text-slate-500">
            <Check size={13} className="text-cyan-400" />
            Connected
          </span>
        </div>

        {/* Identity */}
        <div className="mt-5">
          <div className="flex min-w-0 items-start justify-between gap-4">
            <div className="min-w-0">
              <Link
                to={`/developers/${connection?._id}`}
                className="block truncate text-[19px] font-bold tracking-tight text-white transition hover:text-cyan-300"
              >
                {name}
              </Link>

              {email && (
                <p className="mt-1 truncate text-xs text-slate-500">
                  {email}
                </p>
              )}
            </div>
          </div>

          {connection?.location && (
            <div className="mt-4 flex min-w-0 items-center gap-2 text-xs text-slate-400">
              <MapPin size={14} className="shrink-0 text-slate-500" />
              <span className="truncate">{connection.location}</span>
            </div>
          )}

          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <Clock3 size={13} className="shrink-0" />
            <span>{isOnline ? "Active now" : formatLastSeen(connection?.lastSeen)}</span>
          </div>
        </div>

        {/* Bio */}
        <p className="mt-5 line-clamp-3 min-h-[66px] text-[13px] leading-6 text-slate-400">
          {bio}
        </p>

        {/* Skills */}
        <div className="mt-5 min-h-[34px]">
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {skills.slice(0, 5).map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="rounded-lg border border-cyan-400/10 bg-cyan-400/[0.06] px-2.5 py-1.5 text-[11px] font-medium text-cyan-300"
                >
                  {skill}
                </span>
              ))}

              {skills.length > 5 && (
                <span className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5 text-[11px] font-medium text-slate-500">
                  +{skills.length - 5}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[11px] text-slate-600">
              <Sparkles size={13} />
              Skills not added yet
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 grid grid-cols-2 gap-2.5">
          <Link
            to={`/developers/${connection?._id}`}
            className="group/action inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-3 py-3 text-xs font-semibold text-[#061018] transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-[#111827]"
          >
            <ExternalLink size={15} />
            View Profile
            <ArrowUpRight
              size={13}
              className="opacity-50 transition-transform group-hover/action:-translate-y-0.5 group-hover/action:translate-x-0.5"
            />
          </Link>

          <Link
            to={`/messages?userId=${connection?._id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#334155] bg-[#0b1220] px-3 py-3 text-xs font-medium text-slate-200 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.04] hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-[#111827]"
          >
            <MessageCircle size={15} />
            Message
          </Link>
        </div>

        <button
          type="button"
          onClick={() => onRemove(connection)}
          disabled={isRemoving}
          className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-transparent py-2.5 text-[11px] font-medium text-slate-600 transition hover:border-red-400/15 hover:bg-red-400/[0.04] hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-400/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRemoving ? (
            <>
              <RefreshCw size={13} className="animate-spin" />
              Removing connection...
            </>
          ) : (
            <>
              <UserMinus size={14} />
              Remove connection
            </>
          )}
        </button>
      </div>
    </article>
  );
}

function Connections() {
  const token = localStorage.getItem("token");

  const [connections, setConnections] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [connectionToRemove, setConnectionToRemove] = useState(null);

  const fetchConnections = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await axios.get(
        `${API}/connections/my-connections`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 15_000,
        }
      );

      const nextConnections = Array.isArray(response.data?.connections)
        ? response.data.connections.filter(Boolean)
        : [];

      setConnections(nextConnections);
    } catch (err) {
      console.error("Connections Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your connections. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    if (!notice) return;

    const timer = window.setTimeout(() => {
      setNotice("");
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [notice]);

  const filteredConnections = useMemo(() => {
    const query = search.trim().toLowerCase();

    return connections.filter((connection) => {
      const name = connection?.name?.toLowerCase() || "";
      const email = connection?.email?.toLowerCase() || "";
      const bio = connection?.bio?.toLowerCase() || "";
      const location = connection?.location?.toLowerCase() || "";

      const skills = Array.isArray(connection?.skills)
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
        (filter === "online" && connection?.isOnline) ||
        (filter === "offline" && !connection?.isOnline);

      return matchesSearch && matchesFilter;
    });
  }, [connections, search, filter]);

  const onlineCount = useMemo(
    () => connections.filter((connection) => connection?.isOnline).length,
    [connections]
  );

  const removeConnection = async () => {
    if (!connectionToRemove?._id) return;

    const connectionId = connectionToRemove._id;
    const connectionName =
      connectionToRemove.name || "this connection";

    try {
      setRemovingId(connectionId);
      setError("");

      await axios.delete(`${API}/connections/remove/${connectionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 15_000,
      });

      setConnections((previous) =>
        previous.filter(
          (connection) => connection?._id !== connectionId
        )
      );

      setConnectionToRemove(null);

      setNotice(`${connectionName} was removed from your network.`);
    } catch (err) {
      console.error("Remove Connection Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to remove this connection. Please try again."
      );

      setConnectionToRemove(null);
    } finally {
      setRemovingId(null);
    }
  };

  const clearSearch = () => {
    setSearch("");
  };

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <>
      <div className="mx-auto max-w-7xl">
        {/* =========================================================
            HERO
        ========================================================== */}
        <section className="relative mb-8 overflow-hidden rounded-[30px] border border-[#263243] bg-[#111827] px-6 py-7 sm:px-8 sm:py-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(34,211,238,0.10),transparent_34%),radial-gradient(circle_at_100%_100%,rgba(34,211,238,0.045),transparent_35%)]" />

          <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                Developer Network
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl lg:text-[44px]">
                Your network.
                <span className="text-slate-500"> Your builders.</span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-[15px]">
                Stay connected with developers you can build with. Find
                conversations, profiles and active collaborators from one
                workspace.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchConnections({ silent: true })}
              disabled={refreshing}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#334155] bg-[#0b1220] px-4 py-3 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.04] hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh network"}
            </button>
          </div>
        </section>

        {/* =========================================================
            STATS
        ========================================================== */}
        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="group rounded-2xl border border-[#263243] bg-[#111827] p-5 transition hover:border-cyan-400/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                Connections
              </span>

              <Users
                size={18}
                className="text-cyan-400 transition-transform group-hover:scale-110"
              />
            </div>

            <div className="mt-4 flex items-end gap-2">
              <span className="text-3xl font-bold tracking-tight text-white">
                {connections.length}
              </span>
              <span className="pb-1 text-xs text-slate-600">people</span>
            </div>
          </div>

          <div className="group rounded-2xl border border-[#263243] bg-[#111827] p-5 transition hover:border-emerald-400/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                Online now
              </span>

              <span className="relative flex h-5 w-5 items-center justify-center">
                <span className="absolute h-2 w-2 animate-ping rounded-full bg-emerald-400/40" />
                <Circle
                  size={10}
                  fill="currentColor"
                  className="relative text-emerald-400"
                />
              </span>
            </div>

            <div className="mt-4 flex items-end gap-2">
              <span className="text-3xl font-bold tracking-tight text-white">
                {onlineCount}
              </span>
              <span className="pb-1 text-xs text-slate-600">active</span>
            </div>
          </div>

          <div className="group rounded-2xl border border-[#263243] bg-[#111827] p-5 transition hover:border-violet-400/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                Currently showing
              </span>

              <UserRound
                size={18}
                className="text-violet-300 transition-transform group-hover:scale-110"
              />
            </div>

            <div className="mt-4 flex items-end gap-2">
              <span className="text-3xl font-bold tracking-tight text-white">
                {filteredConnections.length}
              </span>
              <span className="pb-1 text-xs text-slate-600">
                of {connections.length}
              </span>
            </div>
          </div>
        </section>

        {/* =========================================================
            SEARCH + FILTER
        ========================================================== */}
        <section className="mb-8 rounded-[26px] border border-[#263243] bg-[#111827] p-3 sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search your network by name, skill or location..."
                aria-label="Search connections"
                className="w-full rounded-2xl border border-[#263243] bg-[#0b1220] py-3.5 pl-11 pr-11 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-[#334155] focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/[0.06]"
              />

              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.04] hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-[#263243] bg-[#0b1220] p-1">
              <div className="flex shrink-0 items-center gap-1 px-2 text-slate-600">
                <SlidersHorizontal size={14} />
              </div>

              {FILTERS.map((item) => {
                const active = filter === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFilter(item.value)}
                    aria-pressed={active}
                    className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
                      active
                        ? "bg-cyan-400 text-[#061018] shadow-[0_4px_16px_rgba(34,211,238,0.12)]"
                        : "text-slate-500 hover:bg-white/[0.03] hover:text-slate-200"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {(search || filter !== "all") && (
            <div className="mt-3 flex items-center justify-between px-1 text-[11px] text-slate-600">
              <span>
                {filteredConnections.length}{" "}
                {filteredConnections.length === 1
                  ? "connection"
                  : "connections"}{" "}
                match your current view.
              </span>

              {(search || filter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                  }}
                  className="font-medium text-cyan-500 transition hover:text-cyan-300"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </section>

        {/* =========================================================
            ERROR
        ========================================================== */}
        {error && (
          <div
            role="alert"
            className="mb-8 flex items-start gap-3 rounded-2xl border border-red-400/15 bg-red-400/[0.04] p-4"
          >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-400/10">
              <AlertCircle size={16} className="text-red-300" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-red-200">
                Something went wrong
              </p>

              <p className="mt-1 text-xs leading-5 text-red-300/70">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchConnections()}
              className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-400/10"
            >
              Retry
            </button>
          </div>
        )}

        {/* =========================================================
            CONTENT
        ========================================================== */}
        {!error && connections.length === 0 && <EmptyNetwork />}

        {!error &&
          connections.length > 0 &&
          filteredConnections.length === 0 && (
            <div className="rounded-[28px] border border-[#263243] bg-[#111827] px-6 py-20 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#263243] bg-[#0b1220]">
                <Search size={26} className="text-slate-600" />
              </div>

              <h2 className="mt-6 text-xl font-bold text-white">
                Nothing matches this view
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Try another search term or switch your connection status
                filter.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
                className="mt-6 rounded-xl border border-[#334155] bg-[#0b1220] px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-300"
              >
                Reset view
              </button>
            </div>
          )}

        {!error && filteredConnections.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between px-1">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Your connections
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                  People already in your professional network.
                </p>
              </div>

              <span className="rounded-full border border-[#263243] bg-[#111827] px-3 py-1.5 text-[11px] font-medium text-slate-500">
                {filteredConnections.length}{" "}
                {filteredConnections.length === 1
                  ? "connection"
                  : "connections"}
              </span>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredConnections.map((connection) => (
                <ConnectionCard
                  key={connection?._id}
                  connection={connection}
                  onRemove={setConnectionToRemove}
                  removingId={removingId}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* =========================================================
          SUCCESS TOAST
      ========================================================== */}
      {notice && (
        <div className="fixed bottom-5 right-5 z-50 w-[calc(100%-40px)] max-w-sm rounded-2xl border border-emerald-400/15 bg-[#111827]/95 p-4 shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400/10">
              <Check size={16} className="text-emerald-300" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">Network updated</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                {notice}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
              className="text-slate-600 transition hover:text-white"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          REMOVE CONFIRMATION MODAL
      ========================================================== */}
      {connectionToRemove && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-connection-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setConnectionToRemove(null);
            }
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-[26px] border border-[#334155] bg-[#111827] shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
            <div className="p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-400/15 bg-red-400/[0.06]">
                  <UserMinus size={19} className="text-red-300" />
                </div>

                <button
                  type="button"
                  onClick={() => setConnectionToRemove(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white/[0.04] hover:text-white"
                  aria-label="Close dialog"
                >
                  <X size={17} />
                </button>
              </div>

              <h2
                id="remove-connection-title"
                className="mt-6 text-xl font-bold tracking-tight text-white"
              >
                Remove this connection?
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                <span className="font-semibold text-slate-200">
                  {connectionToRemove.name || "This developer"}
                </span>{" "}
                will be removed from your network. You can send a new
                connection request later.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setConnectionToRemove(null)}
                  disabled={Boolean(removingId)}
                  className="rounded-xl border border-[#334155] bg-[#0b1220] px-4 py-3 text-xs font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white disabled:opacity-50"
                >
                  Keep connection
                </button>

                <button
                  type="button"
                  onClick={removeConnection}
                  disabled={Boolean(removingId)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-400 px-4 py-3 text-xs font-semibold text-[#160708] transition hover:bg-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {removingId ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <UserMinus size={14} />
                      Remove connection
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Connections;