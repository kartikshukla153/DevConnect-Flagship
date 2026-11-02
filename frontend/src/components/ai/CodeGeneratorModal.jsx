import { useState } from "react";
import { AlertCircle, Check, Clipboard, Code2, Loader2, RefreshCw, X } from "lucide-react";
import api from "../../api/axios";
import CodeReviewModal from "./CodeReviewModal";

export default function CodeGeneratorModal({ task, onClose }) {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [reviewFile, setReviewFile] = useState(null);
  const [copiedFile, setCopiedFile] = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");
    setFiles([]);

    try {
      const { data } = await api.post("/ai-code/generate", { taskId: task._id }, { timeout: 50_000 });
      if (!Array.isArray(data?.files) || data.files.length === 0) {
        throw new Error("The generator returned no files. Please try again.");
      }
      setFiles(data.files);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        requestError.message ||
        "Code generation failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const copy = async (file) => {
    try {
      await navigator.clipboard.writeText(file.code);
      setCopiedFile(file.filename);
      window.setTimeout(() => setCopiedFile(""), 1500);
    } catch {
      setError("Clipboard access was unavailable in this browser.");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6">
        <section role="dialog" aria-modal="true" aria-labelledby="code-generator-title" className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0E1725] shadow-2xl shadow-black/50">
          <header className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300"><Code2 size={18} /></div>
              <div>
                <h2 id="code-generator-title" className="text-sm font-semibold text-white">AI starter-code generator</h2>
                <p className="mt-0.5 text-xs text-slate-500">{task.title}</p>
              </div>
            </div>
            <button type="button" onClick={onClose} aria-label="Close code generator" className="rounded-lg p-2 text-slate-500 transition hover:bg-white/[0.06] hover:text-white"><X size={17} /></button>
          </header>

          <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3 sm:px-6">
            <p className="text-xs text-slate-500">Generate reviewable starter files grounded in this task and its project.</p>
            <button type="button" onClick={generate} disabled={loading} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-violet-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-violet-300 disabled:opacity-50">
              {loading ? <Loader2 size={14} className="animate-spin" /> : files.length ? <RefreshCw size={14} /> : <Code2 size={14} />}
              {loading ? "Generating…" : files.length ? "Regenerate" : "Generate code"}
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
            {error && <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-rose-400/15 bg-rose-400/[0.06] p-3 text-xs text-rose-300"><AlertCircle size={15} className="mt-0.5 shrink-0" />{error}</div>}
            {loading && (
              <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
                <Loader2 size={24} className="animate-spin text-violet-300" />
                <p className="text-sm font-medium text-slate-200">Designing the implementation</p>
                <p className="text-xs text-slate-500">The AI is preparing files for this task.</p>
              </div>
            )}
            {!loading && files.length === 0 && !error && (
              <div className="flex min-h-48 flex-col items-center justify-center text-center">
                <Code2 size={25} className="text-slate-600" />
                <p className="mt-3 text-sm font-medium text-slate-300">No generated files yet</p>
                <p className="mt-1 text-xs text-slate-500">Generate a starter implementation to review it here.</p>
              </div>
            )}
            <div className="space-y-5">
              {files.map((file) => (
                <article key={file.filename} className="overflow-hidden rounded-xl border border-white/[0.08]">
                  <div className="flex flex-col gap-3 bg-white/[0.035] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-emerald-300">{file.filename}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{file.description || file.language || "Generated source file"}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button type="button" onClick={() => copy(file)} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1.5 text-[11px] text-slate-400 hover:text-white">
                        {copiedFile === file.filename ? <Check size={12} /> : <Clipboard size={12} />}
                        {copiedFile === file.filename ? "Copied" : "Copy"}
                      </button>
                      <button type="button" onClick={() => setReviewFile(file)} className="rounded-md border border-amber-300/15 px-2.5 py-1.5 text-[11px] text-amber-200 hover:bg-amber-300/[0.06]">Review</button>
                    </div>
                  </div>
                  <pre className="max-h-[460px] overflow-auto bg-[#080E18] p-4 text-xs leading-6 text-slate-200"><code>{file.code}</code></pre>
                </article>
              ))}
            </div>
          </div>
          <footer className="border-t border-white/[0.06] px-5 py-3 text-[10px] leading-5 text-slate-600 sm:px-6">
            Generated code is a starting point, not verified software. Review, test and security-check it before integrating it.
          </footer>
        </section>
      </div>

      {reviewFile && <CodeReviewModal file={reviewFile} onClose={() => setReviewFile(null)} />}
    </>
  );
}
