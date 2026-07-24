import { useEffect, useState } from "react";
import {
  X,
  Copy,
  Check,
  Mail,
  MessageCircle,
  Linkedin,
  Twitter,
  Share2,
} from "lucide-react";

function ShareWorkspaceModal({
  open,
  onClose,
  project,
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    if (open) {
      document.addEventListener("keydown", handleKey);
    }

    return () =>
      document.removeEventListener(
        "keydown",
        handleKey
      );
  }, [open, onClose]);

  if (!open) return null;

  const url = window.location.href;

  async function copyLink() {
    await navigator.clipboard.writeText(url);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  const encodedUrl = encodeURIComponent(url);

  const encodedText = encodeURIComponent(
    `Check out this DevConnect workspace: ${
      project?.title || ""
    }`
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-md"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#111827] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 p-6">

          <div className="flex items-center gap-3">

            <div className="rounded-2xl bg-cyan-500/15 p-3">

              <Share2
                className="text-cyan-400"
                size={22}
              />

            </div>

            <div>

              <h2 className="text-2xl font-bold text-white">
                Share Workspace
              </h2>

              <p className="text-sm text-slate-400">
                Invite collaborators to your project.
              </p>

            </div>

          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 transition hover:bg-white/10"
          >
            <X />
          </button>

        </div>

        <div className="space-y-6 p-6">

          <div>

            <p className="mb-3 text-sm text-slate-400">
              Workspace Link
            </p>

            <div className="flex items-center gap-3">

              <input
                readOnly
                value={url}
                className="flex-1 rounded-2xl border border-white/10 bg-[#0B1220] p-4 text-sm text-slate-300"
              />

              <button
                onClick={copyLink}
                className="flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-4 font-semibold text-black transition hover:bg-cyan-300"
              >
                {copied ? (
                  <>
                    <Check size={18} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    Copy
                  </>
                )}
              </button>

            </div>

          </div>

          <div className="grid grid-cols-2 gap-4">

            <a
              href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#0B1220] p-4 transition hover:border-cyan-400 hover:bg-cyan-500/10"
            >
              <MessageCircle size={20} />
              WhatsApp
            </a>

            <a
              href={`mailto:?subject=${encodedText}&body=${encodedUrl}`}
              className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#0B1220] p-4 transition hover:border-cyan-400 hover:bg-cyan-500/10"
            >
              <Mail size={20} />
              Email
            </a>

            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#0B1220] p-4 transition hover:border-cyan-400 hover:bg-cyan-500/10"
            >
              <Linkedin size={20} />
              LinkedIn
            </a>

            <a
              href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#0B1220] p-4 transition hover:border-cyan-400 hover:bg-cyan-500/10"
            >
              <Twitter size={20} />
              X
            </a>

          </div>

          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-200">
            Anyone with this workspace link can open the project page. Project
            permissions are still enforced by DevConnect authentication.
          </div>

        </div>

      </div>

    </div>
  );
}

export default ShareWorkspaceModal;