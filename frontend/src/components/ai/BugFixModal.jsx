import { useState } from "react";
import { AlertCircle, Check, Clipboard, Loader2, ShieldCheck, X } from "lucide-react";
import api from "../../api/axios";

export default function BugFixModal({ onClose }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const fixBug = async () => {
    if (!code.trim()) {
      setError("Paste the code you want analyzed first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const { data } = await api.post("/ai-bug/fix", { code }, { timeout: 50_000 });
      setResult(data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        "Code analysis failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!result?.fixedCode) return;
    try {
      await navigator.clipboard.writeText(result.fixedCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Clipboard access was unavailable in this browser.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6">
      <section role="dialog" aria-modal="true" aria-labelledby="bugfix-title" className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0E1725] shadow-2xl shadow-black/50">
        <header className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-300/15 bg-amber-300/[0.07] text-amber-200"><ShieldCheck size={18} /></div>
            <div>
              <h2 id="bugfix-title" className="text-sm font-semibold text-white">AI code diagnostics</h2>
              <p className="mt-0.5 text-xs text-slate-500">Inspect defects, understand risks and review a suggested correction.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close bug fixer" className="rounded-lg p-2 text-slate-500 hover:bg-white/[0.06] hover:text-white"><X size={17} /></button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
          <div>
            <label htmlFor="bugfix-source" className="mb-2 block text-xs font-medium text-slate-300">Source code</label>
            <textarea
              id="bugfix-source"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              maxLength={20000}
              spellCheck={false}
              placeholder="Paste a focused source file or code snippet here…"
              className="min-h-[220px] w-full resize-y rounded-xl border border-white/10 bg-[#080E18] p-4 font-mono text-xs leading-6 text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-300/30"
            />
            <div className="mt-1 text-right text-[10px] text-slate-600">{code.length.toLocaleString()} / 20,000 characters</div>
          </div>

          <button type="button" onClick={fixBug} disabled={loading || !code.trim()} className="inline-flex items-center gap-2 rounded-lg bg-amber-300 px-4 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
            {loading ? "Analyzing code…" : "Analyze and suggest a fix"}
          </button>

          {error && <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-400/15 bg-rose-400/[0.06] px-3 py-2.5 text-xs text-rose-300"><AlertCircle size={14} className="mt-0.5 shrink-0" />{error}</div>}

          {result && (
            <div className="space-y-5 border-t border-white/[0.07] pt-5">
              <section>
                <h3 className="text-sm font-semibold text-white">Findings</h3>
                {result.bugs?.length ? (
                  <ul className="mt-3 space-y-2">
                    {result.bugs.map((item, index) => <li key={`${index}-${item}`} className="rounded-lg border border-rose-300/10 bg-rose-300/[0.04] px-3 py-2.5 text-xs leading-5 text-slate-300">{item}</li>)}
                  </ul>
                ) : <p className="mt-2 text-xs text-slate-500">No specific defects were returned.</p>}
              </section>

              <section>
                <h3 className="text-sm font-semibold text-white">Explanation</h3>
                <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-slate-300">{result.explanation}</p>
              </section>

              <section>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-white">Suggested corrected code</h3>
                  <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1.5 text-[11px] text-slate-400 hover:text-white">{copied ? <Check size={12} /> : <Clipboard size={12} />}{copied ? "Copied" : "Copy code"}</button>
                </div>
                <pre className="max-h-[460px] overflow-auto rounded-xl border border-white/[0.07] bg-[#080E18] p-4 text-xs leading-6 text-emerald-100"><code>{result.fixedCode}</code></pre>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-white">Recommended practices</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-6 text-slate-400">
                  {result.bestPractices?.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}
                </ul>
              </section>
              <p className="text-[10px] leading-5 text-slate-600">AI suggestions are not a substitute for running tests, reviewing dependencies or performing a security review.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
