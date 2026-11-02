import { useEffect, useState } from "react";
import { AlertCircle, Loader2, X } from "lucide-react";
import api from "../../api/axios";

export default function CodeReviewModal({ file, onClose }) {
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    api.post("/ai/review", {
      filename: file.filename,
      code: file.code,
    }, { timeout: 50_000 })
      .then(({ data }) => {
        if (active) setReview(data);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ||
            "Code review failed. Please try again."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [file.filename, file.code, retry]);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6">
      <section role="dialog" aria-modal="true" aria-labelledby="review-title" className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0E1725] p-5 shadow-2xl sm:p-7">
        <header className="mb-6 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-400">AI quality review</p>
            <h2 id="review-title" className="mt-1 text-xl font-semibold text-white">Code review</h2>
            <p className="mt-1 text-xs text-slate-500">{file.filename}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close code review" className="rounded-lg p-2 text-slate-500 hover:bg-white/[0.06] hover:text-white"><X size={17} /></button>
        </header>

        {loading && <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center"><Loader2 size={22} className="animate-spin text-cyan-300" /><p className="text-sm text-slate-300">Reviewing the generated source…</p></div>}
        {!loading && error && <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center"><AlertCircle size={20} className="text-amber-300" /><p className="max-w-md text-xs text-slate-300">{error}</p><button type="button" onClick={() => { setLoading(true); setError(""); setRetry((value) => value + 1); }} className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950">Retry review</button></div>}
        {!loading && review && (
          <div className="space-y-6">
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Quality score</p>
              <p className="mt-1 text-3xl font-semibold text-emerald-300">{review.score ?? "—"}<span className="text-base text-slate-500"> / 10</span></p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{review.summary}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: "Strengths", items: review.strengths, tone: "text-emerald-300" },
                { title: "Issues", items: review.issues, tone: "text-rose-300" },
                { title: "Improvements", items: review.improvements, tone: "text-cyan-300" },
              ].map((group) => (
                <section key={group.title} className="rounded-xl border border-white/[0.07] bg-[#111C2B] p-4">
                  <h3 className={`text-xs font-semibold ${group.tone}`}>{group.title}</h3>
                  <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-400">
                    {(group.items || []).map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}
                  </ul>
                  {!group.items?.length && <p className="mt-3 text-xs text-slate-600">No items returned.</p>}
                </section>
              ))}
            </div>
            {review.improvedCode && (
              <section>
                <h3 className="mb-3 text-sm font-semibold text-white">Suggested improved version</h3>
                <pre className="max-h-[420px] overflow-auto rounded-xl border border-white/[0.07] bg-[#080E18] p-4 text-xs leading-6 text-emerald-100"><code>{review.improvedCode}</code></pre>
              </section>
            )}
            <p className="text-[10px] leading-5 text-slate-600">The score and recommendations are AI-generated heuristics, not a substitute for automated tests or human review.</p>
          </div>
        )}
      </section>
    </div>
  );
}
