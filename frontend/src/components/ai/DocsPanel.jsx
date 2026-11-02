import { useCallback, useEffect, useState } from "react";
import { AlertCircle, BookOpen, Check, Clipboard, Code2, FileText, Layers3, Loader2, RefreshCw } from "lucide-react";
import api from "../../api/axios";

const TABS = [
  { id: "readme", label: "README", icon: FileText },
  { id: "architecture", label: "Architecture", icon: BookOpen },
  { id: "database", label: "Database", icon: Layers3 },
  { id: "api", label: "API", icon: Code2 },
];

function MarkdownContent({ content }) {
  const lines = String(content || "").split("\n");
  const blocks = [];
  let codeLines = [];
  let inCode = false;
  let codeLanguage = "";

  const flushCode = () => {
    blocks.push(
      <pre key={`code-${blocks.length}`} className="my-4 overflow-x-auto rounded-xl border border-white/[0.07] bg-[#080E18] p-4 text-xs leading-6 text-cyan-100">
        <code data-language={codeLanguage}>{codeLines.join("\n")}</code>
      </pre>
    );
    codeLines = [];
  };

  lines.forEach((line, index) => {
    const fence = line.match(/^```([\w+-]*)/);
    if (fence && !inCode) {
      inCode = true;
      codeLanguage = fence[1] || "text";
      return;
    }
    if (line.startsWith("```") && inCode) {
      inCode = false;
      flushCode();
      return;
    }
    if (inCode) {
      codeLines.push(line);
      return;
    }

    if (!line.trim()) return;
    if (line.startsWith("### ")) {
      blocks.push(<h4 key={index} className="mt-5 text-sm font-semibold text-slate-100">{line.slice(4)}</h4>);
    } else if (line.startsWith("## ")) {
      blocks.push(<h3 key={index} className="mt-6 text-base font-semibold text-white">{line.slice(3)}</h3>);
    } else if (line.startsWith("# ")) {
      blocks.push(<h2 key={index} className="mt-2 text-xl font-semibold tracking-tight text-white">{line.slice(2)}</h2>);
    } else if (/^\s*[-*]\s+/.test(line)) {
      blocks.push(<div key={index} className="flex gap-2 py-1 text-sm leading-6 text-slate-300"><span className="text-cyan-400">•</span><span>{line.replace(/^\s*[-*]\s+/, "")}</span></div>);
    } else if (/^\d+\.\s+/.test(line)) {
      blocks.push(<div key={index} className="py-1 text-sm leading-6 text-slate-300">{line}</div>);
    } else {
      blocks.push(<p key={index} className="text-sm leading-7 text-slate-300">{line}</p>);
    }
  });

  if (inCode && codeLines.length) flushCode();

  return <div className="space-y-2">{blocks}</div>;
}

export default function DocsPanel({ projectId }) {
  const [docs, setDocs] = useState(null);
  const [activeTab, setActiveTab] = useState("readme");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const loadDocs = useCallback(async (force = false) => {
    if (!projectId) {
      setError("A project is required to generate documentation.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/ai-docs/generate", { projectId, force }, { timeout: 50_000 });
      setDocs(data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        "Documentation could not be generated. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!projectId) return;
      setLoading(true);
      setError("");
      try {
        const { data } = await api.post("/ai-docs/generate", { projectId }, { timeout: 50_000 });
        if (active) setDocs(data);
      } catch (requestError) {
        if (active) {
          setError(requestError.response?.data?.message || "Documentation could not be generated.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => { active = false; };
  }, [projectId]);

  const copyDocument = async () => {
    const content = docs?.[activeTab];
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Clipboard access was unavailable in this browser.");
    }
  };

  const currentTab = TABS.find((tab) => tab.id === activeTab) || TABS[0];

  return (
    <section className="mt-10 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0E1624]">
      <div className="flex flex-col gap-4 border-b border-white/[0.06] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-400">
            <BookOpen size={14} /> Engineering knowledge base
          </div>
          <h2 className="mt-1 text-lg font-semibold text-white">AI documentation</h2>
          <p className="mt-1 text-xs text-slate-500">Project-specific technical documentation generated from the saved workspace.</p>
        </div>
        <button
          type="button"
          onClick={() => loadDocs(true)}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Regenerate
        </button>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-white/[0.06] px-4 py-3">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${
              activeTab === id
                ? "bg-cyan-400/10 text-cyan-200"
                : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
            }`}
            aria-pressed={activeTab === id}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      <div className="min-h-[260px] px-5 py-5 sm:px-6">
        {loading ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
            <Loader2 size={22} className="animate-spin text-cyan-300" />
            <p className="text-sm font-medium text-slate-200">Preparing project documentation</p>
            <p className="text-xs text-slate-500">Grounding the docs in your saved project details.</p>
          </div>
        ) : error ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
            <AlertCircle size={22} className="text-amber-300" />
            <p className="max-w-lg text-sm text-slate-300">{error}</p>
            <button type="button" onClick={() => loadDocs(true)} className="rounded-lg bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-300">Try again</button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="text-xs font-medium text-slate-400">{currentTab.label}</div>
              <button
                type="button"
                onClick={copyDocument}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-slate-500 transition hover:bg-white/[0.05] hover:text-slate-200"
              >
                {copied ? <Check size={13} /> : <Clipboard size={13} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <MarkdownContent content={docs?.[activeTab]} />
          </>
        )}
      </div>
    </section>
  );
}
