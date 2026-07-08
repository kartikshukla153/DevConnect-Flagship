export default function formatLastSeen(date) {
  if (!date) return "Offline";

  const diff = Math.floor(
    (Date.now() - new Date(date)) / 1000
  );

  if (diff < 60)
    return "Last seen just now";

  if (diff < 3600)
    return `Last seen ${Math.floor(diff / 60)} min ago`;

  if (diff < 86400)
    return `Last seen ${Math.floor(diff / 3600)} hr ago`;

  return `Last seen ${Math.floor(diff / 86400)} day ago`;
}