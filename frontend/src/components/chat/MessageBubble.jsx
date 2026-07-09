function MessageBubble({
  message,
  isMine,
}) {
  return (
    <div
      className={`px-4 py-2 rounded-lg max-w-[70%]
      ${
        isMine
          ? "bg-cyan-500 ml-auto"
          : "bg-gray-700"
      }`}
    >
      {message.text}
    </div>
  );
}

export default MessageBubble;