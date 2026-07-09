function TypingIndicator({
  typing,
  receiverName,
}) {
  if (!typing) return null;

  return (
    <div className="px-4 py-2 text-sm italic text-gray-400">

      {receiverName} is typing...

    </div>
  );
}

export default TypingIndicator;