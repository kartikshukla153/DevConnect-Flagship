import { useEffect, useRef, useState } from "react";
import { Bot, ChevronDown, Loader2, Send, Sparkles, X } from "lucide-react";
import api from "../../api/axios";

export default function AIChat({ projectId }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const askAI = async (event) => {
    event?.preventDefault();
    const question = message.trim();
    if (!question || loading || !projectId) return;

    setMessage("");
    setError("");
    setMessages((current) => [...current, { role: "user", content: question }]);
    setLoading(true);

    try {
      const { data } = await api.post("/ai-chat", {
        message: question,
        projectId,
      }, { timeout: 50_000 });

      if (typeof data?.reply !== "string" || !data.reply.trim()) {
        throw new Error("The assistant returned an empty response.");
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply.trim() },
      ]);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        requestError.message ||
        "The assistant could not respond. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <section
          aria-label="AI project copilot"
          className="fixed bottom-24 right-4 z-[80] flex h-[min(620px,calc(100vh-8rem))] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0D1625] shadow-2xl shadow-black/50 sm:bottom-24 sm:right-6"
        >
          <header className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                <Bot size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">DevConnect Copilot</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Project-aware engineering assistant
                </p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close copilot" className="rounded-lg p-2 text-slate-500 transition hover:bg-white/[0.06] hover:text-white">
              <X size={17} />
            </button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/[0.04] p-4">
                <Sparkles size={17} className="text-cyan-300" />
                <p className="mt-3 text-sm font-semibold text-slate-100">Think through the engineering.</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">Ask about architecture, implementation trade-offs, debugging, testing or the next steps for this project.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Review the architecture", "What should I build next?", "Suggest testing strategy"].map((suggestion) => (
                    <button key={suggestion} type="button" onClick={() => setMessage(suggestion)} className="rounded-full border border-white/10 px-2.5 py-1.5 text-[10px] text-slate-400 transition hover:border-cyan-400/30 hover:text-cyan-200">
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((item, index) => (
              <div key={`${item.role}-${index}`} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[90%] rounded-2xl px-3.5 py-3 text-xs leading-6 ${
                  item.role === "user"
                    ? "rounded-br-md bg-cyan-400 text-slate-950"
                    : "rounded-bl-md border border-white/[0.07] bg-white/[0.04] text-slate-200"
                }`}>
                  <p className="whitespace-pre-wrap break-words">{item.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Loader2 size={14} className="animate-spin text-cyan-300" />
                Thinking through your question…
              </div>
            )}
            {error && <p role="alert" className="rounded-lg border border-rose-400/15 bg-rose-400/[0.06] px-3 py-2 text-xs text-rose-300">{error}</p>}
            <div ref={endRef} />
          </div>

          <form onSubmit={askAI} className="border-t border-white/[0.07] p-3">
            <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-[#080F1A] p-2 focus-within:border-cyan-400/40">
              <textarea
                ref={inputRef}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    askAI();
                  }
                }}
                rows={2}
                maxLength={4000}
                placeholder="Ask about this project…"
                aria-label="Message the AI copilot"
                className="max-h-28 min-h-[48px] flex-1 resize-none bg-transparent px-2 py-1.5 text-xs leading-5 text-white outline-none placeholder:text-slate-600"
              />
              <button type="submit" disabled={!message.trim() || loading} aria-label="Send message" className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400 text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40">
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-600">AI can make mistakes. Review generated code before using it.</p>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close AI Copilot" : "Open AI Copilot"}
        className="fixed bottom-5 right-5 z-[81] inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-[#102338] px-4 py-3 text-xs font-semibold text-cyan-100 shadow-xl shadow-black/30 transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-[#16314B] sm:bottom-6 sm:right-6"
      >
        {open ? <ChevronDown size={16} /> : <Sparkles size={16} />}
        {open ? "Close Copilot" : "AI Copilot"}
      </button>
    </>
  );
}
