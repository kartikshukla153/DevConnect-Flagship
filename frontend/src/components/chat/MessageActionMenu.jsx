function ActionButton({
  icon,
  text,
  danger = false,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full
        flex
        items-center
        gap-3
        px-4
        py-3
        text-sm
        transition-all
        ${
          danger
            ? "text-red-400 hover:bg-red-500 hover:text-white"
            : "text-gray-200 hover:bg-cyan-500/10 hover:text-cyan-300"
        }
      `}
    >
      <span className="text-lg">
        {icon}
      </span>

      <span>{text}</span>
    </button>
  );
}

function MessageActionMenu({
  isMine,
  onReply,
  onEdit,
  onDelete,
  onReact,
}) {
  return (
    <div
      className="
        absolute
        right-0
        top-10
        z-[999]
        w-56
        rounded-2xl
        border
        border-gray-700
        bg-[#111827]
        shadow-2xl
        overflow-hidden
      "
    >
      <ActionButton
        icon="↩"
        text="Reply"
        onClick={onReply}
      />

      <ActionButton
        icon="😀"
        text="React"
        onClick={onReact}
      />

      {isMine && (
        <>
          <div className="mx-3 border-t border-gray-700" />

          <ActionButton
            icon="✏"
            text="Edit"
            onClick={onEdit}
          />

          <ActionButton
            icon="🗑"
            text="Delete"
            danger
            onClick={onDelete}
          />
        </>
      )}
    </div>
  );
}

export default MessageActionMenu;