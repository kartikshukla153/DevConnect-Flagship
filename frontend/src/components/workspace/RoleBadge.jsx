function RoleBadge({ role }) {
  const styles = {
    owner:
      "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    admin:
      "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    member:
      "bg-[#1F2937] text-gray-300 border-[#374151]",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
        styles[role] || styles.member
      }`}
    >
      {role}
    </span>
  );
}

export default RoleBadge;