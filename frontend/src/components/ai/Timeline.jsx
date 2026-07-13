export default function Timeline({ milestones }) {
  return (
    <div
      style={{
        marginTop: 40,
      }}
    >
      <h2
        style={{
          color: "white",
          marginBottom: 20,
        }}
      >
        Project Timeline
      </h2>

      {milestones.map((m, index) => {
        const completed = m.tasks.filter(
          (t) => t.status === "completed"
        ).length;

        const percent =
          m.tasks.length === 0
            ? 0
            : Math.round(
                (completed / m.tasks.length) * 100
              );

        return (
          <div
            key={m.title}
            style={{
              display: "flex",
              gap: 20,
              marginBottom: 28,
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background:
                  percent === 100
                    ? "#22c55e"
                    : "#3b82f6",
                flexShrink: 0,
              }}
            />

            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "white",
                }}
              >
                <strong>{m.title}</strong>

                <span>{percent}%</span>
              </div>

              <div
                style={{
                  height: 10,
                  background: "#1f2937",
                  borderRadius: 20,
                  marginTop: 10,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${percent}%`,
                    height: "100%",
                    background: "#22c55e",
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}