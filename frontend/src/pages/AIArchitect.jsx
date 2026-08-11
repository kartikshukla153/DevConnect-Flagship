import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Code2,
  Layers3,
  Lightbulb,
  Loader2,
  Sparkles,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";

import Workspace from "../components/ai/Workspace";

const API = "http://localhost:5000/api";

const EXAMPLE_IDEAS = [
  "A real-time developer collaboration platform with chat, task management and AI assistance",
  "An AI-powered resume analyzer that gives recruiters actionable candidate insights",
  "A SaaS platform for managing remote engineering teams and project delivery",
];

function AIArchitect() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [workspace, setWorkspace] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadWorkspace = async () => {
      const projectId = localStorage.getItem("aiProjectId");

      if (!projectId || !token) return;

      try {
        const res = await axios.get(
          `${API}/ai/workspace/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setWorkspace(res.data);
      } catch (err) {
        console.error("Failed to load AI workspace:", err);
      }
    };

    loadWorkspace();
  }, [token]);

  const generateProject = async () => {
    const trimmedIdea = idea.trim();

    if (!trimmedIdea) {
      setError("Describe the product you want to build first.");
      return;
    }

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    try {
      setError("");
      setLoading(true);

      const roadmapRes = await axios.post(
        `${API}/ai/generate-roadmap`,
        {
          idea: trimmedIdea,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const projectId = roadmapRes.data?.project?._id;

      if (!projectId) {
        throw new Error(
          "AI generated a response but no project was returned."
        );
      }

      localStorage.setItem("aiProjectId", projectId);

      const workspaceRes = await axios.get(
        `${API}/ai/workspace/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setWorkspace(workspaceRes.data);
    } catch (err) {
      console.error("AI Architect error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to generate the workspace right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearWorkspace = () => {
    setWorkspace(null);
    localStorage.removeItem("aiProjectId");
  };

  const characterCount = idea.length;

  const generationState = useMemo(() => {
    if (loading) {
      return {
        label: "Architecting workspace",
        description:
          "AI is turning your product idea into a structured engineering plan.",
      };
    }

    if (workspace) {
      return {
        label: "Workspace generated",
        description:
          "Your AI-generated engineering workspace is ready.",
      };
    }

    return {
      label: "Ready to architect",
      description:
        "Describe an idea and let DevConnect turn it into an actionable plan.",
    };
  }, [loading, workspace]);

  return (
    <div className="min-h-screen pb-16">
      {/* =========================================
          HERO
      ========================================== */}

      <section className="relative overflow-hidden rounded-[32px] border border-white/[0.07] bg-[#0E1624] shadow-2xl shadow-black/20">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-40 h-[420px] w-[420px] rounded-full bg-cyan-500/[0.06] blur-3xl" />

          <div className="absolute -bottom-48 left-1/3 h-[400px] w-[400px] rounded-full bg-blue-500/[0.04] blur-3xl" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.07),transparent_30%)]" />
        </div>

        <div className="relative px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
          {/* Eyebrow */}
          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.08]">
              <BrainCircuit
                size={20}
                className="text-cyan-300"
              />
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
                DevConnect Intelligence
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                AI-powered engineering architecture
              </p>
            </div>
          </div>

          {/* Main heading */}
          <div className="max-w-4xl">
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
              Turn an idea into an
              <span className="block text-slate-400">
                engineering workspace.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Describe what you want to build. DevConnect Architect
              transforms the idea into a structured product roadmap,
              technical direction, milestones and an actionable
              workspace.
            </p>
          </div>

          {/* =========================================
              INPUT
          ========================================== */}

          <div className="mt-10 max-w-5xl">
            <div
              className={`overflow-hidden rounded-2xl border bg-[#0A111D]/90 shadow-xl transition-all duration-300 ${
                loading
                  ? "border-cyan-400/30 shadow-cyan-950/20"
                  : "border-white/[0.08] focus-within:border-cyan-400/30 focus-within:shadow-cyan-950/20"
              }`}
            >
              <textarea
                value={idea}
                onChange={(event) => {
                  setIdea(event.target.value);
                  if (error) setError("");
                }}
                disabled={loading}
                rows={6}
                maxLength={3000}
                placeholder="Example: Build a platform where developers can discover teammates, collaborate on projects, manage tasks, chat in real time and use AI to review their code..."
                className="min-h-[170px] w-full resize-none bg-transparent px-6 py-5 text-[15px] leading-7 text-white outline-none placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <div className="flex flex-col gap-4 border-t border-white/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Sparkles size={14} />
                  <span>
                    {characterCount}/3000 characters
                  </span>
                </div>

                <button
                  type="button"
                  onClick={generateProject}
                  disabled={loading || !idea.trim()}
                  className="group flex items-center justify-center gap-2.5 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-[#071017] shadow-lg shadow-cyan-500/10 transition-all duration-200 hover:bg-cyan-300 hover:shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Architecting...
                    </>
                  ) : (
                    <>
                      <WandSparkles size={17} />
                      Generate Workspace
                      <ArrowRight
                        size={16}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/15 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
                <X size={17} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* =========================================
              EXAMPLE IDEAS
          ========================================== */}

          {!workspace && !loading && (
            <div className="mt-7 max-w-5xl">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-500">
                <Lightbulb size={14} />
                Need inspiration?
              </div>

              <div className="grid gap-2 md:grid-cols-3">
                {EXAMPLE_IDEAS.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setIdea(example)}
                    className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition-all duration-200 hover:border-cyan-400/20 hover:bg-cyan-400/[0.03]"
                  >
                    <p className="line-clamp-3 text-xs leading-5 text-slate-500 transition-colors group-hover:text-slate-400">
                      {example}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================
          STATUS / VALUE STRIP
      ========================================== */}

      <section className="mt-5 grid gap-4 sm:grid-cols-3">
        <StatusCard
          icon={<Zap size={17} />}
          title="Product thinking"
          description="Turn vague ideas into structured product direction."
        />

        <StatusCard
          icon={<Code2 size={17} />}
          title="Technical direction"
          description="Translate requirements into engineering decisions."
        />

        <StatusCard
          icon={<Layers3 size={17} />}
          title="Execution ready"
          description="Break the product into milestones you can actually build."
        />
      </section>

      {/* =========================================
          GENERATION STATUS
      ========================================== */}

      <section className="mt-5 rounded-2xl border border-white/[0.06] bg-[#0E1624] px-5 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                loading
                  ? "bg-cyan-400/10 text-cyan-300"
                  : workspace
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "bg-white/[0.04] text-slate-500"
              }`}
            >
              {loading ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : workspace ? (
                <CheckCircle2 size={17} />
              ) : (
                <Clock3 size={17} />
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-slate-200">
                {generationState.label}
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                {generationState.description}
              </p>
            </div>
          </div>

          {workspace && (
            <button
              type="button"
              onClick={clearWorkspace}
              className="text-xs font-medium text-slate-500 transition hover:text-slate-300"
            >
              Start a new architecture
            </button>
          )}
        </div>
      </section>

      {/* =========================================
          GENERATED WORKSPACE
      ========================================== */}

      {workspace && (
        <section className="mt-8">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
                Generated Workspace
              </p>

              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                Your engineering blueprint
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Sparkles size={14} />
              Generated by DevConnect AI
            </div>
          </div>

          <Workspace
            workspace={workspace}
            setWorkspace={setWorkspace}
          />
        </section>
      )}
    </div>
  );
}

function StatusCard({
  icon,
  title,
  description,
}) {
  return (
    <div className="group rounded-2xl border border-white/[0.06] bg-[#0E1624] p-5 transition-all duration-200 hover:border-white/[0.1]">
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-slate-400 transition-colors group-hover:bg-cyan-400/[0.07] group-hover:text-cyan-300">
        {icon}
      </div>

      <h3 className="text-sm font-semibold text-slate-200">
        {title}
      </h3>

      <p className="mt-1.5 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

export default AIArchitect;