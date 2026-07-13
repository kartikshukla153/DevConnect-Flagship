function TechStack({ techStack }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        marginTop: 15,
        marginBottom: 30,
      }}
    >
      {techStack.map((tech) => (
        <div
          key={tech}
          style={{
            background: "#2563eb",
            color: "white",
            padding: "8px 15px",
            borderRadius: 999,
            fontWeight: 600,
          }}
        >
          {tech}
        </div>
      ))}
    </div>
  );
}

export default TechStack;