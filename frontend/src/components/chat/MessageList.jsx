import MessageBubble from "./MessageBubble";

function MessageList({
  messages,
  currentUser,
  bottomRef,
  setReplyingTo,
  search,
  onImageClick,
}) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((message) => {
        const senderId =
          typeof message.sender === "string"
            ? message.sender
            : message.sender?._id;

        const isMine =
          senderId === currentUser.id;

        return (
          <MessageBubble
            key={message._id}
            message={message}
            isMine={isMine}
            onReply={setReplyingTo}
            search={search}
            onImageClick={onImageClick}
          />
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}

export default MessageList;