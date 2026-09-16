import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Users,
  Wifi,
  X,
} from "lucide-react";

import DeveloperCard from "../components/developers/DeveloperCard";
import SearchBar from "../components/developers/SearchBar";
import useOnlineUsers from "../hooks/useOnlineUsers";

const API = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const PAGE_SIZE = 12;

function Developers() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(
    Math.max(Number(searchParams.get("page")) || 1, 1)
  );

  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  const [location, setLocation] = useState(
    searchParams.get("location") || ""
  );

  const [availability, setAvailability] = useState(
    searchParams.get("availability") || ""
  );

  const [totalProfiles, setTotalProfiles] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const onlineUsers = useOnlineUsers();

  const requestIdRef = useRef(0);

  const hasFilters = Boolean(
    search.trim() ||
      location.trim() ||
      availability.trim()
  );

  /*
   * Keep the URL synchronized with the current directory state.
   * This allows the global Topbar search to open the same search.
   */
  useEffect(() => {
    const nextParams = new URLSearchParams();

    if (search.trim()) {
      nextParams.set("search", search.trim());
    }

    if (location.trim()) {
      nextParams.set("location", location.trim());
    }

    if (availability.trim()) {
      nextParams.set("availability", availability.trim());
    }

    if (page > 1) {
      nextParams.set("page", String(page));
    }

    const current = searchParams.toString();
    const next = nextParams.toString();

    if (current !== next) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [
    search,
    location,
    availability,
    page,
    searchParams,
    setSearchParams,
  ]);

  /*
   * Fetch developers.
   */
  const fetchDevelopers = useCallback(
    async ({ targetPage = 1, signal } = {}) => {
      const requestId = ++requestIdRef.current;

      try {
        setLoading(true);
        setError("");

        const params = {
          page: targetPage,
          limit: PAGE_SIZE,
        };

        if (search.trim()) {
          params.skill = search.trim();
        }

        if (location.trim()) {
          params.location = location.trim();
        }

        if (availability.trim()) {
          params.availability = availability.trim();
        }

        const response = await axios.get(
          `${API}/profile/search/skills`,
          {
            params,
            signal,
          }
        );

        if (requestId !== requestIdRef.current) {
          return;
        }

        const data = response.data || {};

        setProfiles(
          Array.isArray(data.profiles)
            ? data.profiles
            : []
        );

        setTotalProfiles(
          Math.max(Number(data.totalProfiles) || 0, 0)
        );

        setTotalPages(
          Math.max(Number(data.totalPages) || 1, 1)
        );

        setPage(
          Math.max(
            Number(data.page) || targetPage,
            1
          )
        );
      } catch (err) {
        if (
          err?.code === "ERR_CANCELED" ||
          err?.name === "CanceledError"
        ) {
          return;
        }

        console.error(
          "DEVELOPERS DIRECTORY FETCH ERROR:",
          err
        );

        if (requestId === requestIdRef.current) {
          setError(
            err?.response?.data?.message ||
              "Unable to load developers right now."
          );
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [search, location, availability]
  );

  /*
   * Reload whenever page/search/filter state changes.
   */
  useEffect(() => {
    const controller = new AbortController();

    fetchDevelopers({
      targetPage: page,
      signal: controller.signal,
    });

    return () => {
      controller.abort();
    };
  }, [
    page,
    search,
    location,
    availability,
    fetchDevelopers,
  ]);

  const handleSearch = useCallback((values) => {
    setSearch(values.search || "");
    setLocation(values.location || "");
    setAvailability(values.availability || "");
    setPage(1);
  }, []);

  const handleReset = useCallback(() => {
    setSearch("");
    setLocation("");
    setAvailability("");
    setPage(1);
  }, []);

  const handleRetry = useCallback(() => {
    fetchDevelopers({
      targetPage: page,
    });
  }, [fetchDevelopers, page]);

  const visibleCountLabel = useMemo(() => {
    if (loading && profiles.length === 0) {
      return "Finding developers...";
    }

    if (totalProfiles === 0) {
      return "No developers found";
    }

    const start =
      (page - 1) * PAGE_SIZE + 1;

    const end = Math.min(
      page * PAGE_SIZE,
      totalProfiles
    );

    return `${start}–${end} of ${totalProfiles}`;
  }, [
    loading,
    profiles.length,
    totalProfiles,
    page,
  ]);

  const onlineCount = useMemo(
    () =>
      Array.isArray(onlineUsers)
        ? onlineUsers.length
        : 0,
    [onlineUsers]
  );

  const goToPreviousPage = () => {
    if (page > 1) {
      setPage((current) => current - 1);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const goToNextPage = () => {
    if (page < totalPages) {
      setPage((current) => current + 1);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      {/* Directory heading */}
      <section className="border-b border-white/[0.08] pb-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-400">
              <span className="text-cyan-400">
                {"</>"}
              </span>
              Developer directory
            </div>

            <h1 className="max-w-3xl text-3xl font-bold tracking-[-0.035em] text-white sm:text-4xl">
              Find the people who can{" "}
              <span className="text-cyan-400">
                build with you.
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Discover developers by their stack,
              experience, location and availability.
              Build your next team around real
              engineering skills.
            </p>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-2">
            <div className="min-w-[112px] rounded-2xl border border-white/[0.07] bg-[#0F1726] px-4 py-3">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] text-slate-500">
                <Users
                  size={13}
                  className="text-cyan-400"
                />
                Developers
              </div>

              <p className="mt-1 text-xl font-bold text-white">
                {totalProfiles}
              </p>
            </div>

            <div className="min-w-[112px] rounded-2xl border border-white/[0.07] bg-[#0F1726] px-4 py-3">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] text-slate-500">
                <Wifi
                  size={13}
                  className="text-cyan-400"
                />
                Online now
              </div>

              <p className="mt-1 text-xl font-bold text-white">
                {onlineCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="mt-5">
        <SearchBar
          search={search}
          location={location}
          availability={availability}
          onSearch={handleSearch}
          onReset={handleReset}
        />
      </section>

      {/* Results toolbar */}
      <section className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">
            Developers
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {visibleCountLabel}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-white/[0.14] hover:text-white"
            >
              <X size={13} />
              Clear filters
            </button>
          )}

          <button
            type="button"
            onClick={handleRetry}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-cyan-400/20 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-red-400/10 bg-red-400/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-red-300">
              Could not load developers
            </p>
            <p className="mt-1 text-xs text-red-300/60">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-400/[0.1]"
          >
            <RefreshCw size={13} />
            Try again
          </button>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && profiles.length === 0 && (
        <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-3">
          {Array.from({ length: 6 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-[500px] animate-pulse rounded-[26px] border border-white/[0.06] bg-[#0F1726]"
              />
            )
          )}
        </div>
      )}

      {/* Empty state */}
      {!loading &&
        !error &&
        profiles.length === 0 && (
          <div className="mt-5 flex min-h-[360px] flex-col items-center justify-center rounded-[26px] border border-dashed border-white/[0.08] bg-[#0F1726]/50 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.05] text-cyan-300">
              <Search size={22} />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-white">
              No developers found
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Try a different developer name,
              skill, headline, location or
              availability filter.
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-[#07111f] transition hover:bg-cyan-300"
              >
                Clear search
              </button>
            )}
          </div>
        )}

      {/* Developer grid */}
      {profiles.length > 0 && (
        <div
          className={`mt-5 grid grid-cols-1 gap-4 xl:grid-cols-3 ${
            loading ? "opacity-60" : ""
          }`}
        >
          {profiles.map((profile) => (
            <DeveloperCard
              key={
                profile?._id ||
                profile?.user?._id
              }
              profile={profile}
              onlineUsers={onlineUsers}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2 pb-4">
          <button
            type="button"
            onClick={goToPreviousPage}
            disabled={page <= 1}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.02] text-slate-400 transition hover:border-cyan-400/20 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Previous page"
          >
            <ChevronLeft size={17} />
          </button>

          <div className="rounded-xl border border-white/[0.07] bg-[#0F1726] px-4 py-2 text-xs font-medium text-slate-400">
            Page{" "}
            <span className="text-white">
              {page}
            </span>{" "}
            of{" "}
            <span className="text-white">
              {totalPages}
            </span>
          </div>

          <button
            type="button"
            onClick={goToNextPage}
            disabled={page >= totalPages}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.02] text-slate-400 transition hover:border-cyan-400/20 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Next page"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      )}
    </div>
  );
}

export default Developers;
