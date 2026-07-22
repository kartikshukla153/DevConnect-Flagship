import {
  Search,
  ArrowUpDown,
  Filter,
  LayoutGrid,
  CheckCircle2,
  Clock3,
  CircleDashed,
} from "lucide-react";

function WorkspaceToolbar({
  search,
  setSearch,
  filter,
  setFilter,
  sort,
  setSort,
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#111827]">

      {/* Top */}

      <div className="flex flex-col gap-6 border-b border-white/10 p-6 xl:flex-row xl:items-center xl:justify-between">

        {/* Search */}

        <div className="relative w-full xl:max-w-xl">

          <Search
            size={20}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search tasks, assignees, labels..."
            className="
              w-full
              rounded-2xl
              border
              border-white/10
              bg-[#0B1220]
              py-4
              pl-14
              pr-5
              text-white
              placeholder:text-slate-500
              outline-none
              transition-all
              duration-300
              focus:border-cyan-400
              focus:ring-4
              focus:ring-cyan-500/10
            "
          />

        </div>

        {/* Right */}

        <div className="flex flex-wrap gap-3">

          <button
            className="
              flex
              items-center
              gap-2
              rounded-2xl
              border
              border-cyan-500/30
              bg-cyan-500/10
              px-5
              py-3
              text-sm
              font-semibold
              text-cyan-300
              transition-all
              hover:bg-cyan-500/20
            "
          >
            <LayoutGrid size={17} />
            Kanban View
          </button>

        </div>

      </div>

      {/* Bottom */}

      <div className="flex flex-col gap-5 p-6 xl:flex-row xl:items-center xl:justify-between">

        {/* Filters */}

        <div className="flex flex-wrap gap-4">

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0B1220] px-5">

            <Filter
              size={17}
              className="text-cyan-400"
            />

            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value)
              }
              className="
                bg-transparent
                py-4
                pr-4
                text-white
                outline-none
              "
            >
              <option value="all">
                All Tasks
              </option>

              <option value="todo">
                Todo
              </option>

              <option value="in-progress">
                In Progress
              </option>

              <option value="review">
                Review
              </option>

              <option value="completed">
                Completed
              </option>

              <option value="high">
                High Priority
              </option>

            </select>

          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0B1220] px-5">

            <ArrowUpDown
              size={17}
              className="text-cyan-400"
            />

            <select
              value={sort}
              onChange={(e) =>
                setSort(e.target.value)
              }
              className="
                bg-transparent
                py-4
                pr-4
                text-white
                outline-none
              "
            >
              <option value="newest">
                Newest
              </option>

              <option value="oldest">
                Oldest
              </option>

              <option value="priority">
                Priority
              </option>

              <option value="deadline">
                Deadline
              </option>

            </select>

          </div>

        </div>

        {/* Status Pills */}

        <div className="flex flex-wrap gap-3">

          <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-[#0B1220] px-4 py-2">

            <CircleDashed
              size={15}
              className="text-slate-400"
            />

            <span className="text-sm text-slate-300">
              Todo
            </span>

          </div>

          <div className="flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2">

            <Clock3
              size={15}
              className="text-yellow-400"
            />

            <span className="text-sm text-yellow-300">
              In Progress
            </span>

          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2">

            <CheckCircle2
              size={15}
              className="text-emerald-400"
            />

            <span className="text-sm text-emerald-300">
              Completed
            </span>

          </div>

        </div>

      </div>

    </section>
  );
}

export default WorkspaceToolbar;