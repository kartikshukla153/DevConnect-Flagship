import MessageBubble from "./MessageBubble";

function MessageList({
  messages,
  currentUser,
  bottomRef,
}) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">

      {messages.map((message) => (

        <MessageBubble
          key={message._id}
          message={message}
          isMine={
            message.sender === currentUser._id ||
            message.sender?._id === currentUser._id
          }
        />

      ))}

      <div ref={bottomRef} />

    </div>
  );
}

export default MessageList;