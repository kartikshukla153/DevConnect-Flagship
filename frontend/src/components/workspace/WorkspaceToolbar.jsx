import { ArrowUpDown, CheckCircle2, CircleDashed, Clock3, Filter, LayoutGrid, RefreshCw, Search } from "lucide-react";

function WorkspaceToolbar({ search, setSearch, filter, setFilter, sort, setSort, totalTasks = 0, visibleTasks = 0, refreshing, onRefresh }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#111827] p-3 sm:p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative min-w-0 flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, description, assignee or label…" className="w-full rounded-xl border border-white/10 bg-[#0B1220] py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-500/5" />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0B1220] px-3">
            <Filter size={15} className="text-cyan-400" />
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-transparent py-3 text-sm text-slate-200 outline-none">
              <option value="all">All tasks</option>
              <option value="todo">Todo</option>
              <option value="in-progress">In progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
              <option value="high">High priority</option>
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0B1220] px-3">
            <ArrowUpDown size={15} className="text-cyan-400" />
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent py-3 text-sm text-slate-200 outline-none">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="priority">Priority</option>
              <option value="deadline">Deadline</option>
            </select>
          </div>

          <button onClick={onRefresh} disabled={refreshing} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/10 disabled:opacity-50">
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3 border-t border-white/5 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[.03] px-3 py-1.5 text-slate-400"><LayoutGrid size={13} /> Kanban</span>
          <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[.03] px-3 py-1.5 text-slate-400"><CircleDashed size={13} /> Todo</span>
          <span className="flex items-center gap-1.5 rounded-full border border-amber-500/10 bg-amber-500/5 px-3 py-1.5 text-amber-300"><Clock3 size={13} /> In progress</span>
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/10 bg-emerald-500/5 px-3 py-1.5 text-emerald-300"><CheckCircle2 size={13} /> Completed</span>
        </div>
        <span className="text-xs text-slate-500">Showing {visibleTasks} of {totalTasks} tasks</span>
      </div>
    </section>
  );
}

export default WorkspaceToolbar;
