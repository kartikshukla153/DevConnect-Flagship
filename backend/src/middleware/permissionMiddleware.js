import Project from "../models/project.js";

const permission =
  (...roles) =>
  async (req, res, next) => {
    try {
      const projectId =
        req.params.projectId ||
        req.body.projectId;

      const project =
        await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      const member =
        project.members.find(
          (m) =>
            m.user.toString() ===
            req.user._id.toString()
        );

      if (!member) {
        return res.status(403).json({
          message: "Not a project member",
        });
      }

      if (
        !roles.includes(member.role)
      ) {
        return res.status(403).json({
          message:
            "Permission denied",
        });
      }

      req.project = project;
      req.member = member;

      next();
    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  };

export default permission;