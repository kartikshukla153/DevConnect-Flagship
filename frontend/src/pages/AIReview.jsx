import { useEffect, useState } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";

function AIReview() {
  const [filename, setFilename] = useState("App.jsx");

  const [code, setCode] = useState(`function add(a,b){
  return a+b
}

console.log(add(5,10))
`);

  const [review, setReview] = useState(null);

  const [pullRequest, setPullRequest] = useState(null);

const [generatingPR, setGeneratingPR] = useState(false);

  const [loading, setLoading] = useState(false);

  const loadingSteps = [
    "Reading source code...",
    "Checking security...",
    "Reviewing architecture...",
    "Analyzing performance...",
    "Finding bugs...",
    "Generating improvements...",
    "Preparing engineering report..."
  ];

  const [loadingIndex, setLoadingIndex] = useState(0);

  useEffect(() => {

    if (!loading) return;

    const interval = setInterval(() => {

      setLoadingIndex((prev) => {

        if (prev >= loadingSteps.length - 1) {
          return prev;
        }

        return prev + 1;

      });

    }, 900);

    return () => clearInterval(interval);

  }, [loading]);

  async function handleReview() {

    try {

      setLoading(true);

      setLoadingIndex(0);

      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/ai/review",
        {
          filename,
          code,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReview(res.data);

    } catch (err) {

      console.log(err);

      alert("AI Review Failed");

    } finally {

      setLoading(false);

    }

  }
async function generatePR() {
  try {
    setPullRequest({
      title: "Improve code quality and follow engineering best practices",

      description: `
## Summary

This pull request improves the overall engineering quality of the submitted code.

### Improvements

- Better readability
- Better maintainability
- Improved code structure
- Production-ready formatting
- AI-generated optimized implementation

### AI Review Score

${review.score}/100
      `,
    });
  } catch (err) {
    console.log(err);
  }
}
  return (

    <div className="min-h-screen bg-[#0B1220] text-white">

      <div className="mx-auto max-w-[1800px] p-10">

        <div className="mb-10">

          <h1 className="text-5xl font-black tracking-tight">

            AI Engineering Assistant

          </h1>

          <p className="mt-3 text-lg text-slate-400">

            Production-grade AI Code Review Platform

          </p>

        </div>

        <div className="grid gap-8 xl:grid-cols-2">

          {/* LEFT PANEL */}

          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-[#111827] shadow-2xl">

            <div className="border-b border-slate-800 p-6">

              <label className="mb-2 block text-sm font-semibold text-slate-400">

                Filename

              </label>

              <input
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="App.jsx"
                className="w-full rounded-xl border border-slate-700 bg-[#0B1220] px-4 py-3 outline-none focus:border-cyan-400"
              />

            </div>

            <div className="h-[700px]">

              <Editor
                language="javascript"
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || "")}
                options={{
                  minimap: {
                    enabled: false,
                  },
                  fontSize: 15,
                  automaticLayout: true,
                  smoothScrolling: true,
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  tabSize: 2,
                  padding: {
                    top: 20,
                  },
                }}
              />

            </div>

            <div className="border-t border-slate-800 p-6">

              <button
                onClick={handleReview}
                disabled={loading}
                className="w-full rounded-xl bg-cyan-400 py-4 text-lg font-bold text-black transition hover:bg-cyan-300 disabled:opacity-50"
              >

                {loading ? "Reviewing..." : "Review Code"}

              </button>

            </div>

          </div>

          {/* RIGHT PANEL */}

          <div className="space-y-6">
             {!review ? (

              <div className="rounded-3xl border border-slate-800 bg-[#111827] p-10 text-center">

                <h2 className="text-2xl font-bold">
                  Waiting for AI Review
                </h2>

                <p className="mt-3 text-slate-400">
                  Paste your code and click
                  <span className="text-cyan-400"> Review Code</span>
                </p>

              </div>

            ) : (

              <>

                {/* SCORE */}

                <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-slate-900 p-8">

                  <p className="text-sm uppercase tracking-widest text-cyan-400">
                    Overall Score
                  </p>

                  <h2 className="mt-3 text-6xl font-black text-cyan-300">
                    {review.score}/100
                  </h2>

                  <p className="mt-4 text-slate-300">
                    {review.summary}
                  </p>

                </div>

                {/* VERDICT */}

                <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6">

                  <p className="text-sm text-slate-400">
                    Merge Verdict
                  </p>

                  <h2 className="mt-3 text-2xl font-bold text-green-400">
                    {review.verdict}
                  </h2>

                </div>

                {/* SECURITY */}

                <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6">

                  <h2 className="mb-4 text-xl font-bold">
                    Security
                  </h2>

                  <ul className="space-y-2">

                    {review.security?.length ? (

                      review.security.map((item, index) => (

                        <li
                          key={index}
                          className="rounded-lg bg-red-500/10 p-3 text-red-300"
                        >
                          {item}
                        </li>

                      ))

                    ) : (

                      <li className="text-green-400">
                        No security issues found.
                      </li>

                    )}

                  </ul>

                </div>

                {/* PERFORMANCE */}

                <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6">

                  <h2 className="mb-4 text-xl font-bold">
                    Performance
                  </h2>

                  <ul className="space-y-2">

                    {review.performance?.length ? (

                      review.performance.map((item, index) => (

                        <li
                          key={index}
                          className="rounded-lg bg-yellow-500/10 p-3 text-yellow-300"
                        >
                          {item}
                        </li>

                      ))

                    ) : (

                      <li className="text-green-400">
                        No performance issues found.
                      </li>

                    )}

                  </ul>

                
          </div>
                          {/* AI Improved Code */}

                <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6">

                  <div className="mb-5 flex items-center justify-between">

                    <h2 className="text-xl font-bold">
                      AI Improved Code
                    </h2>

                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(
                          review.improvedCode || ""
                        )
                      }
                      className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-black hover:bg-cyan-400"
                    >
                      Copy Code
                    </button>

                  </div>

                  <pre className="overflow-x-auto rounded-xl bg-[#0B1220] p-5 text-sm text-green-300">
                    <code>
                      {review.improvedCode}
                    </code>
                  </pre>

                </div>

                {/* AI Pull Request */}
<div className="rounded-2xl border border-slate-800 bg-[#111827] p-6">

  <div className="flex items-center justify-between">

    <div>

      <h2 className="text-2xl font-bold">
        AI Pull Request
      </h2>

      <p className="mt-2 text-slate-400">
        Generate a professional GitHub Pull Request from this review.
      </p>

    </div>

    <button
      onClick={generatePR}
      className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-black hover:bg-cyan-400"
    >
      Generate PR
    </button>

  </div>

  {pullRequest && (

    <div className="mt-8 rounded-xl border border-cyan-500/20 bg-[#0B1220] p-6">

      <p className="text-xs uppercase tracking-widest text-cyan-400">
        Pull Request Title
      </p>

      <h3 className="mt-2 text-2xl font-bold">
        {pullRequest.title}
      </h3>

      <p className="mt-8 text-xs uppercase tracking-widest text-cyan-400">
        Description
      </p>

      <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-slate-300">
{pullRequest.description}
      </pre>

    </div>

  )}

</div>

              </>
                          )}

          </div>

        </div>

      </div>

    </div>

  );
}

export default AIReview;