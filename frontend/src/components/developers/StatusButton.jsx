import {
  Check,
  Clock3,
  UserPlus,
  X,
  UserMinus,
  Loader2,
} from "lucide-react";

function StatusButton({
  status,
  sendRequest,
  cancelRequest,
  acceptRequest,
  rejectRequest,
  removeConnection,
  actionLoading,
}) {
  if (status === "self") {
    return (
      <button
        disabled
        className="w-full rounded-2xl border border-[#374151] bg-[#0B1220] px-5 py-3 text-sm font-semibold text-gray-400"
      >
        You
      </button>
    );
  }

  if (status === "connected") {
    return (
      <button
        onClick={removeConnection}
        disabled={actionLoading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-3 text-sm font-semibold text-green-400 transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {actionLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Removing...
          </>
        ) : (
          <>
            <UserMinus size={16} />
            Connected
          </>
        )}
      </button>
    );
  }

  if (status === "pending") {
    return (
      <button
        onClick={cancelRequest}
        disabled={actionLoading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-3 text-sm font-semibold text-yellow-400 transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {actionLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Cancelling...
          </>
        ) : (
          <>
            <Clock3 size={16} />
            Pending
          </>
        )}
      </button>
    );
  }

  if (status === "received") {
    return (
      <div className="flex w-full gap-2">
        <button
          onClick={acceptRequest}
          disabled={actionLoading}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-3 py-3 text-sm font-semibold text-[#07111f] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {actionLoading ? (
            <Loader2
              size={16}
              className="animate-spin"
            />
          ) : (
            <Check size={16} />
          )}

          Accept
        </button>

        <button
          onClick={rejectRequest}
          disabled={actionLoading}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#374151] bg-[#0B1220] px-3 py-3 text-sm font-semibold text-gray-300 transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {actionLoading ? (
            <Loader2
              size={16}
              className="animate-spin"
            />
          ) : (
            <X size={16} />
          )}

          Decline
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={sendRequest}
      disabled={actionLoading}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-[#07111f] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {actionLoading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <UserPlus size={17} />
          Connect
        </>
      )}
    </button>
  );
}

export default StatusButton;