import Project from "../models/project.js";

const checkProjectRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.projectId || req.params.id;

      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      const member = project.members.find(
        (member) =>
          member.user.toString() === req.user._id.toString()
      );

      if (!member) {
        return res.status(403).json({
          success: false,
          message: "You are not a member of this project",
        });
      }

      if (!allowedRoles.includes(member.role)) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to perform this action",
        });
      }

      req.project = project;
      req.projectMember = member;

      next();
    } catch (error) {
      console.log("PROJECT PERMISSION ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  };
};

export default checkProjectRole;