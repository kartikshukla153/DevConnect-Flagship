function ProjectHeader({ project }) {
  return (
    <div
      style={{
        background: "#0f172a",
        padding: 25,
        borderRadius: 15,
        marginBottom: 30,
      }}
    >
      <h1
        style={{
          color: "white",
          marginBottom: 10,
        }}
      >
        {project.title}
      </h1>

      <p
        style={{
          color: "#94a3b8",
          lineHeight: 1.7,
        }}
      >
        {project.overview}
      </p>
    </div>
  );
}

export default ProjectHeader;