import { useEffect, useRef, useState } from "react";
import { Braces, Check, Code2, Image as ImageIcon, Paperclip, Send, Smile, X } from "lucide-react";

const MAX_TEXT = 5000;
const MAX_IMAGE = 5 * 1024 * 1024;
const EMOJIS = ["😀","😂","😍","🔥","🚀","💡","⚡","🎯","💻","🧠","🛠️","✨","❤️","👏","🙌","😎","🤝","📦","🐛","✅","❌","🎉","☕","🌐","🔒","📈","🧩","🧪","🚧","📝","⭐","💯"];

function getUser() { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } }

export default function PostComposer({ onCreatePost, creating = false }) {
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [codeMode, setCodeMode] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const editorRef = useRef(null);
  const user = getUser();

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function selectFile(file) {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please choose an image file."); return; }
    if (file.size > MAX_IMAGE) { setError("Image must be 5 MB or smaller."); return; }
    if (preview) URL.revokeObjectURL(preview);
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function clearFile() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview("");
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function insertEmoji(emoji) {
    const el = editorRef.current;
    const start = el?.selectionStart ?? content.length;
    const end = el?.selectionEnd ?? content.length;
    const next = content.slice(0, start) + emoji + content.slice(end);
    setContent(next.slice(0, MAX_TEXT));
    requestAnimationFrame(() => { el?.focus(); const cursor = Math.min(start + emoji.length, MAX_TEXT); el?.setSelectionRange(cursor, cursor); });
  }

  async function submit() {
    const text = content.trim();
    if (!text && !selectedFile) { setError("Write something or attach an image before publishing."); return; }
    if (text.length > MAX_TEXT) return;
    setError("");
    try {
      const form = new FormData();
      form.append("content", text);
      if (selectedFile) form.append("image", selectedFile);
      await onCreatePost?.(form, { content: text, image: selectedFile, codeMode });
      setContent("");
      clearFile();
      setShowEmoji(false);
      setCodeMode(false);
    } catch (err) {
      setError(err?.message || "Unable to publish this update.");
    }
  }

  return (
    <section className="overflow-visible rounded-[22px] border border-white/[0.075] bg-[#0F172A] shadow-[0_12px_45px_rgba(0,0,0,.10)]">
      <div className="flex items-center justify-between border-b border-white/[0.055] px-5 py-3.5 sm:px-6">
        <div><h2 className="text-sm font-bold text-white">Share an update</h2><p className="mt-0.5 text-[10px] text-slate-600">Share what you are building with your network.</p></div>
        <span className="hidden rounded-full border border-cyan-400/10 bg-cyan-400/[0.05] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-cyan-300 sm:inline-flex">Build in public</span>
      </div>

      <div className="px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-500 text-sm font-black text-[#07131E]">{String(user?.name || "D").charAt(0).toUpperCase()}</div>
          <div className="min-w-0 flex-1">
            <textarea ref={editorRef} value={content} maxLength={MAX_TEXT} onChange={(e) => { setContent(e.target.value); setError(""); }} onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); submit(); } }} rows={codeMode ? 6 : 3} placeholder={codeMode ? "Paste a focused code change, snippet, or engineering note..." : "What are you building today?"} className={`w-full resize-none border-0 bg-transparent px-0 py-1 text-[14px] leading-7 text-slate-200 outline-none placeholder:text-slate-700 ${codeMode ? "font-mono text-[13px]" : ""}`} />
            {preview ? <div className="relative mt-2 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0B1220]"><img src={preview} alt="Selected attachment preview" className="max-h-72 w-full object-contain" /><button type="button" onClick={clearFile} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-xl bg-black/60 text-white backdrop-blur hover:bg-black/80" aria-label="Remove image"><X size={15} /></button><div className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2 py-1 text-[9px] text-slate-300 backdrop-blur">{selectedFile?.name}</div></div> : null}
            {error ? <div className="mt-2 rounded-xl border border-red-400/10 bg-red-400/[0.04] px-3 py-2 text-[10px] text-red-300">{error}</div> : null}
          </div>
        </div>
      </div>

      <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.055] px-5 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-1.5">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => selectFile(e.target.files?.[0])} />
          <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 text-[10px] font-semibold text-slate-400 hover:border-cyan-400/15 hover:text-cyan-300"><ImageIcon size={14} /> Image</button>
          <button type="button" onClick={() => setCodeMode((v) => !v)} className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-[10px] font-semibold ${codeMode ? "border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-300" : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-cyan-300"}`}><Code2 size={14} /> Code</button>
          <button type="button" onClick={() => setShowEmoji((v) => !v)} className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-[10px] font-semibold ${showEmoji ? "border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-300" : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-cyan-300"}`}><Smile size={14} /> Emoji</button>
        </div>
        <div className="flex items-center gap-3"><span className="text-[9px] text-slate-700">{content.length.toLocaleString()} / {MAX_TEXT.toLocaleString()}</span><button type="button" onClick={submit} disabled={creating || (!content.trim() && !selectedFile)} className="inline-flex h-9 items-center gap-2 rounded-xl bg-cyan-400 px-4 text-[10px] font-black text-[#07131E] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-30"><Send size={13} />{creating ? "Publishing" : "Publish"}</button></div>
        {showEmoji ? <div className="absolute bottom-14 left-4 z-50 w-[290px] rounded-2xl border border-white/[0.09] bg-[#111827] p-3 shadow-2xl shadow-black/50"><div className="mb-2 flex items-center justify-between"><span className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">Emoji</span><button type="button" onClick={() => setShowEmoji(false)} className="text-slate-600 hover:text-white"><X size={13} /></button></div><div className="grid grid-cols-8 gap-1">{EMOJIS.map((emoji) => <button key={emoji} type="button" onClick={() => insertEmoji(emoji)} className="flex h-8 items-center justify-center rounded-lg text-lg hover:bg-white/[0.06]">{emoji}</button>)}</div></div> : null}
      </div>
      <div className="px-5 pb-3 sm:px-6"><p className="flex items-center gap-1.5 text-[9px] text-slate-700"><Check size={11} /> Ctrl/Cmd + Enter to publish</p></div>
    </section>
  );
}
