import MessageBubble from "./MessageBubble";

function MessageList({
  messages,
  currentUser,
  bottomRef,
  setReplyingTo,
  search,
  onImageClick,
  onEdit,
  onDelete,
  onReact,
}) {
  return (
    <div className="flex-1 space-y-3 overflow-y-auto p-4">
      {messages.map((message) => {
        const senderId =
          typeof message.sender === "string"
            ? message.sender
            : message.sender?._id;

        const isMine =
          String(senderId) ===
          String(currentUser.id);

        return (
          <MessageBubble
            key={message._id}
            message={message}
            isMine={isMine}
            onReply={setReplyingTo}
            search={search}
            onImageClick={onImageClick}
            onEdit={onEdit}
            onDelete={onDelete}
            onReact={onReact}
          />
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}

export default MessageList;