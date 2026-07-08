function StatusButton({ status, sendRequest }) {
  switch (status) {
    case "self":
      return (
        <button
          disabled
          className="px-5 py-2 rounded-lg bg-gray-700 text-gray-300 cursor-not-allowed"
        >
          You
        </button>
      );

    case "connected":
      return (
        <button
          disabled
          className="px-5 py-2 rounded-lg bg-green-600 text-white cursor-not-allowed"
        >
          Connected
        </button>
      );

    case "pending":
      return (
        <button
          disabled
          className="px-5 py-2 rounded-lg bg-yellow-500 text-black cursor-not-allowed"
        >
          Pending
        </button>
      );

    case "received":
      return (
        <button
          disabled
          className="px-5 py-2 rounded-lg bg-blue-500 text-white cursor-not-allowed"
        >
          Request Received
        </button>
      );

    default:
      return (
        <button
          onClick={sendRequest}
          className="px-5 py-2 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition"
        >
          Connect
        </button>
      );
  }
}

export default StatusButton;