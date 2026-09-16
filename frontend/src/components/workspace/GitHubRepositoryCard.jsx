import { useEffect, useState } from "react";
import { AlertCircle, Eye, GitFork, Link2, RefreshCw, Star } from "lucide-react";
import { connectRepository, fetchRepository } from "../../api/github";

function GitHubRepositoryCard({ projectId }) {
  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const load = async ({ silent = false } = {}) => {
    try {
      if (silent) setRefreshing(true); else setLoading(true);
      setError("");
      setRepo(await fetchRepository(projectId));
    } catch (err) {
      if (err.response?.status === 404) setRepo(null);
      else setError(err.response?.data?.message || "Repository unavailable");
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, [projectId]);

  const connect = async () => {
    if (!url.trim()) { setError("Enter a GitHub repository URL."); return; }
    try { setConnecting(true); setError(""); await connectRepository(projectId, url.trim()); setUrl(""); await load({ silent: true }); }
    catch (err) { setError(err.response?.data?.message || "Unable to connect repository."); }
    finally { setConnecting(false); }
  };

  if (loading) return <section className="rounded-2xl border border-white/10 bg-[#111827] p-5"><div className="h-5 w-36 animate-pulse rounded bg-white/5" /><div className="mt-4 h-10 animate-pulse rounded bg-white/5" /></section>;

  return (
    <section className="rounded-2xl border border-white/10 bg-[#111827] p-5">
      <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-cyan-400">Repository</p><h2 className="mt-1 text-lg font-semibold text-white">GitHub</h2></div>{repo && <button onClick={() => load({ silent: true })} disabled={refreshing} className="rounded-lg border border-white/10 p-2 text-slate-500 hover:bg-white/5 hover:text-white disabled:opacity-50"><RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /></button>}</div>

      {error && <div className="mt-4 rounded-xl border border-amber-500/10 bg-amber-500/5 p-3 text-xs text-amber-200">{error}</div>}

      {!repo ? <div className="mt-4"><p className="text-xs leading-5 text-slate-500">Connect the repository to surface live engineering signals inside the workspace.</p><input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://github.com/owner/repository" className="mt-4 w-full rounded-xl border border-white/10 bg-[#0B1220] px-3 py-3 text-xs text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/30" /><button onClick={connect} disabled={connecting} className="mt-2 w-full rounded-xl bg-cyan-400 px-3 py-3 text-xs font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-50">{connecting ? "Connecting…" : "Connect repository"}</button></div> : <><div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-[#0B1220] p-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{repo.name}</p><p className="mt-1 text-[10px] text-emerald-300">Live repository data</p></div><Link2 size={15} className="shrink-0 text-slate-500" /></div><p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">{repo.description || "No repository description."}</p><div className="mt-4 grid grid-cols-2 gap-2">{[[Star,"Stars",repo.stars],[GitFork,"Forks",repo.forks],[AlertCircle,"Issues",repo.openIssues],[Eye,"Watchers",repo.watchers]].map(([Icon,label,value]) => <div key={label} className="rounded-xl border border-white/5 bg-[#0B1220] p-3"><Icon size={14} className="text-slate-500" /><p className="mt-2 text-lg font-semibold text-white">{value ?? "—"}</p><p className="text-[10px] text-slate-600">{label}</p></div>)}</div></>}
    </section>
  );
}

export default GitHubRepositoryCard;
