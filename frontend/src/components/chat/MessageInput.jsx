import { useRef } from "react";
import {
  Paperclip,
  SendHorizontal,
  X,
} from "lucide-react";
import VoiceRecorder from "./VoiceRecorder";

function MessageInput({
  text,
  setText,
  sendMessage,
  onTyping,
  onStopTyping,
  replyingTo,
  setReplyingTo,
  selectedFile,
  setSelectedFile,
}) {
  const typingTimeout = useRef(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setText(e.target.value);

    onTyping();

    clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      onStopTyping();
    }, 1000);
  };

  const handleFileChange = (e) => {
    if (!e.target.files.length) return;

    setSelectedFile(e.target.files[0]);
  };

  return (
    <>
      {replyingTo && (
        <div className="mx-4 mb-3 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4">

          <div className="flex justify-between items-start">

            <div>

              <p className="text-xs uppercase tracking-wide text-cyan-300">
                Replying to
              </p>

              <h4 className="font-semibold mt-1">
                {replyingTo.sender?.name}
              </h4>

              <p className="text-gray-400 text-sm mt-1 truncate max-w-lg">
                {replyingTo.text}
              </p>

            </div>

            <button
              onClick={() => setReplyingTo(null)}
              className="text-gray-400 hover:text-red-400 transition"
            >
              <X size={18} />
            </button>

          </div>

        </div>
      )}

      {selectedFile && (
        <div className="mx-4 mb-3 rounded-2xl border border-[#374151] bg-[#1F2937] px-4 py-3 flex justify-between items-center">

          <div className="truncate">
            📎 {selectedFile.name}
          </div>

          <button
            onClick={() => {
              setSelectedFile(null);

              if (fileInputRef.current)
                fileInputRef.current.value = "";
            }}
            className="text-red-400 hover:text-red-300"
          >
            <X size={18} />
          </button>

        </div>
      )}

      <div className="border-t border-[#263243] p-4">

        <div className="rounded-2xl border border-[#374151] bg-[#0B1220] flex items-center gap-3 px-4 py-3">

          <button
            onClick={() =>
              fileInputRef.current.click()
            }
            className="text-gray-400 hover:text-cyan-400 transition"
          >
            <Paperclip size={20} />
          </button>

          <input
            ref={fileInputRef}
            hidden
            type="file"
            onChange={handleFileChange}
          />

          <input
            value={text}
            onChange={handleChange}
            placeholder="Message developer..."
            className="flex-1 bg-transparent outline-none text-white placeholder:text-gray-500"
          />

          <VoiceRecorder
            setSelectedFile={setSelectedFile}
          />

          <button
            onClick={sendMessage}
            className="w-11 h-11 rounded-xl bg-cyan-400 hover:bg-cyan-300 transition flex items-center justify-center"
          >
            <SendHorizontal
              size={20}
              className="text-black"
            />
          </button>

        </div>

      </div>
    </>
  );
}

export default MessageInput;