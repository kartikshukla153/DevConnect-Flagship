import {
  Search,
  ArrowUpDown,
  Filter,
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
    <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-[#263243] bg-[#111827] p-5 lg:flex-row lg:items-center lg:justify-between">

      <div className="relative w-full lg:w-[360px]">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
        />

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search tasks..."
          className="w-full rounded-xl border border-[#263243] bg-[#0B1220] py-3 pl-11 pr-4 outline-none focus:border-cyan-400"
        />

      </div>

      <div className="flex flex-wrap gap-3">

        <div className="flex items-center gap-2 rounded-xl border border-[#263243] bg-[#0B1220] px-4">

          <Filter
            size={16}
            className="text-cyan-400"
          />

          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value)
            }
            className="bg-transparent py-3 outline-none"
          >
            <option value="all">
              All
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

        <div className="flex items-center gap-2 rounded-xl border border-[#263243] bg-[#0B1220] px-4">

          <ArrowUpDown
            size={16}
            className="text-cyan-400"
          />

          <select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value)
            }
            className="bg-transparent py-3 outline-none"
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

    </div>
  );
}

export default WorkspaceToolbar;