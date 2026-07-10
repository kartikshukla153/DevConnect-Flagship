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
        transition-all
        duration-150
        text-sm
        ${
          danger
            ? "text-red-400 hover:bg-red-500 hover:text-white"
            : "text-gray-200 hover:bg-cyan-500/10 hover:text-cyan-300"
        }
      `}
    >
      <span className="text-lg">{icon}</span>

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
        top-10
        right-0
        z-[9999]
        w-56
        overflow-hidden
        rounded-2xl
        border
        border-gray-700/70
        bg-[#111827]/95
        backdrop-blur-xl
        shadow-[0_10px_35px_rgba(0,0,0,0.45)]
        animate-in
        fade-in
        zoom-in-95
      "
    >
      <div className="py-2">

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
            <div className="mx-3 my-1 border-t border-gray-700" />

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
    </div>
  );
}

export default MessageActionMenu;