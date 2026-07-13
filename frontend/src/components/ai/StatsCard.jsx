function StatsCard({ title, value, color = "#2563eb" }) {
  return (
    <div
      style={{
        background: "#1e293b",
        borderRadius: 14,
        padding: 20,
        color: "white",
        flex: 1,
        minWidth: 180,
      }}
    >
      <div
        style={{
          color: "#94a3b8",
          fontSize: 14,
          marginBottom: 10,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 32,
          fontWeight: "700",
          color,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default StatsCard;