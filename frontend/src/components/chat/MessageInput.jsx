import { useRef } from "react";

function MessageInput({
  text,
  setText,
  sendMessage,
  onTyping,
  onStopTyping,
}) {
  const typingTimeout = useRef(null);

  const handleChange = (e) => {
    setText(e.target.value);

    onTyping();

    clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      onStopTyping();
    }, 1000);
  };

  return (
    <div className="flex border-t border-gray-700">

      <input
        value={text}
        onChange={handleChange}
        placeholder="Type message..."
        className="flex-1 bg-transparent p-4 outline-none"
      />

      <button
        onClick={sendMessage}
        className="px-6 bg-cyan-500 text-black font-semibold"
      >
        Send
      </button>

    </div>
  );
}

export default MessageInput;