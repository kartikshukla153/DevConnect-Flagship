function OnlineIndicator({ online }) {
  return (
    <span
      className={`inline-block w-3 h-3 rounded-full ${
        online
          ? "bg-green-500"
          : "bg-gray-500"
      }`}
    />
  );
}

export default OnlineIndicator;