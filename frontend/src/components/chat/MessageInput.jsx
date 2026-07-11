import { useRef } from "react";

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
      {/* Reply Preview */}
      {replyingTo && (
        <div className="px-4 py-3 border-t border-gray-700 bg-[#0F172A]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-cyan-400 font-semibold">
                Replying to {replyingTo.sender?.name}
              </p>

              <p className="text-sm text-gray-300 truncate max-w-[500px]">
                {replyingTo.text}
              </p>
            </div>

            <button
              onClick={() => setReplyingTo(null)}
              className="text-gray-400 hover:text-red-400 transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Selected File */}
      {selectedFile && (
        <div className="px-4 py-2 bg-[#111827] border-t border-gray-700 flex justify-between items-center">
          <div className="truncate text-sm text-cyan-300">
            📎 {selectedFile.name}
          </div>

          <button
            onClick={() => {
              setSelectedFile(null);

              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
            className="text-red-400 hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex items-center border-t border-gray-700">

        <button
          onClick={() => fileInputRef.current.click()}
          className="px-4 text-xl hover:text-cyan-400 transition"
        >
          📎
        </button>

        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={handleFileChange}
        />

        <input
          value={text}
          onChange={handleChange}
          placeholder="Type a message..."
          className="
            flex-1
            bg-transparent
            px-5
            py-4
            outline-none
            text-white
            placeholder:text-gray-500
          "
        />

        <button
          onClick={sendMessage}
          className="
            px-8
            bg-cyan-500
            hover:bg-cyan-400
            transition
            text-black
            font-semibold
          "
        >
          Send
        </button>

      </div>
    </>
  );
}

export default MessageInput;