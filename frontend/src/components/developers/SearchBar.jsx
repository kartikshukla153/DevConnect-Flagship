import { useEffect, useState } from "react";
import {
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

function SearchBar({
  search = "",
  location = "",
  availability = "",
  onSearch,
  onReset,
  showFilters = false,
  setShowFilters,
}) {
  const [draftSearch, setDraftSearch] = useState(search);
  const [draftLocation, setDraftLocation] = useState(location);
  const [draftAvailability, setDraftAvailability] =
    useState(availability);

  useEffect(() => {
    setDraftSearch(search);
  }, [search]);

  useEffect(() => {
    setDraftLocation(location);
  }, [location]);

  useEffect(() => {
    setDraftAvailability(availability);
  }, [availability]);

  const handleSubmit = (event) => {
    event.preventDefault();

    onSearch({
      search: draftSearch.trim(),
      location: draftLocation.trim(),
      availability: draftAvailability.trim(),
    });
  };

  const handleReset = () => {
    setDraftSearch("");
    setDraftLocation("");
    setDraftAvailability("");
    onReset();
  };

  const hasDraftValues =
    draftSearch.trim() ||
    draftLocation.trim() ||
    draftAvailability.trim();

  const hasCommittedFilters =
    search.trim() ||
    location.trim() ||
    availability.trim();

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#0F1726] p-3 shadow-[0_18px_60px_rgba(0,0,0,.12)]"
    >
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

      <div className="flex flex-col gap-3 lg:flex-row">
        {/* Main Search */}
        <div className="relative min-w-0 flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="search"
            value={draftSearch}
            onChange={(event) =>
              setDraftSearch(event.target.value)
            }
            placeholder="Search by developer, skill, headline or location..."
            autoComplete="off"
            spellCheck="false"
            aria-label="Search developers"
            className="h-12 w-full rounded-2xl border border-white/[0.07] bg-[#0A1220] pl-11 pr-11 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/[0.11] focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/[0.05]"
          />

          {draftSearch && (
            <button
              type="button"
              onClick={() => setDraftSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-600 transition hover:bg-white/[0.05] hover:text-white"
              aria-label="Clear developer search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="h-12 rounded-2xl bg-cyan-400 px-7 text-sm font-semibold text-[#07111f] shadow-[0_8px_30px_rgba(34,211,238,.12)] transition hover:bg-cyan-300 hover:shadow-[0_10px_35px_rgba(34,211,238,.18)] active:scale-[0.99]"
        >
          <span className="flex items-center justify-center gap-2">
            <Search size={16} />
            Search
          </span>
        </button>

        {/* Mobile Filters */}
        <button
          type="button"
          onClick={() =>
            setShowFilters?.((value) => !value)
          }
          className={`h-12 rounded-2xl border px-5 text-sm font-medium transition lg:hidden ${
            showFilters
              ? "border-cyan-400/30 bg-cyan-400/[0.08] text-cyan-300"
              : "border-white/[0.08] bg-[#0A1220] text-slate-400 hover:border-white/[0.14] hover:text-white"
          }`}
          aria-expanded={showFilters}
          aria-label="Toggle developer filters"
        >
          <span className="flex items-center justify-center gap-2">
            <SlidersHorizontal size={16} />
            Filters
          </span>
        </button>

        {/* Desktop Reset */}
        {hasCommittedFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="hidden h-12 items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-[#0A1220] px-5 text-sm font-medium text-slate-400 transition hover:border-white/[0.14] hover:text-white lg:flex"
          >
            <RotateCcw size={15} />
            Reset
          </button>
        )}
      </div>

      {/* Filters */}
      <div
        className={`grid transition-all duration-200 ${
          showFilters
            ? "mt-3 grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0 lg:grid-rows-[1fr] lg:opacity-100"
        }`}
      >
        <div className="overflow-hidden">
          <div className="grid gap-3 border-t border-white/[0.06] pt-3 md:grid-cols-2 lg:grid-cols-3">
            {/* Location */}
            <div className="relative">
              <MapPin
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
              />

              <input
                type="text"
                value={draftLocation}
                onChange={(event) =>
                  setDraftLocation(event.target.value)
                }
                placeholder="Location"
                autoComplete="off"
                aria-label="Filter by location"
                className="h-11 w-full rounded-xl border border-white/[0.07] bg-[#0A1220] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/[0.11] focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/[0.04]"
              />
            </div>

            {/* Availability */}
            <div className="relative">
              <input
                type="text"
                value={draftAvailability}
                onChange={(event) =>
                  setDraftAvailability(event.target.value)
                }
                placeholder="Availability, e.g. Open to Work"
                autoComplete="off"
                aria-label="Filter by availability"
                className="h-11 w-full rounded-xl border border-white/[0.07] bg-[#0A1220] px-4 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/[0.11] focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/[0.04]"
              />
            </div>

            {/* Search Explanation */}
            <div className="hidden items-center rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs leading-5 text-slate-500 lg:flex">
              Search developer profiles by name,
              skills, headline, bio and location.
            </div>
          </div>

          {/* Mobile Reset */}
          {(hasDraftValues || hasCommittedFilters) && (
            <div className="mt-3 flex justify-end lg:hidden">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0A1220] px-4 py-2.5 text-xs font-medium text-slate-400 transition hover:border-white/[0.14] hover:text-white"
              >
                <RotateCcw size={14} />
                Reset filters
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}

export default SearchBar;