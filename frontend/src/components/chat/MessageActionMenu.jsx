import {
  Edit3,
  Heart,
  Reply,
  Trash2,
} from "lucide-react";

function ActionButton({
  icon,
  text,
  danger = false,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition-all ${
        danger
          ? "text-red-400 hover:bg-red-500 hover:text-white"
          : "text-gray-200 hover:bg-cyan-500/10 hover:text-cyan-300"
      }`}
    >
      <span className="flex w-5 items-center justify-center">
        {icon}
      </span>

      <span>{text}</span>
    </button>
  );
}

function MessageActionMenu({
  message,
  isMine,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onClose,
}) {
  const canEdit =
    isMine &&
    !message?.deleted &&
    Boolean(message?.text?.trim());

  const canDelete =
    isMine && !message?.deleted;

  const canReact =
    !message?.deleted;

  const handleAction = (callback) => {
    callback?.();
    onClose?.();
  };

  return (
    <div
      className="w-56 overflow-hidden rounded-2xl border border-gray-700 bg-[#111827] shadow-2xl"
      role="menu"
    >
      <ActionButton
        icon={<Reply size={17} />}
        text="Reply"
        onClick={() =>
          handleAction(onReply)
        }
      />

      {canReact && (
        <ActionButton
          icon={<Heart size={17} />}
          text="React"
          onClick={() =>
            handleAction(onReact)
          }
        />
      )}

      {canEdit && (
        <>
          <div className="mx-3 border-t border-gray-700" />

          <ActionButton
            icon={<Edit3 size={17} />}
            text="Edit"
            onClick={() =>
              handleAction(onEdit)
            }
          />
        </>
      )}

      {canDelete && (
        <ActionButton
          icon={<Trash2 size={17} />}
          text="Delete"
          danger
          onClick={() =>
            handleAction(onDelete)
          }
        />
      )}
    </div>
  );
}

export default MessageActionMenu;