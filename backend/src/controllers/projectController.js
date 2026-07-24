import Project from "../models/project.js";
import Notification from "../models/Notification.js";
import Task from "../models/Task.js";
import Activity from "../models/Activity.js";
import User from "../models/User.js";
export const createProject = async (req, res) => {
  try {
    const {
  title,
  description,
  overview,
  techStack,
  rolesNeeded,
  status,
  githubRepo,
  liveLink,
  difficulty,
  estimatedWeeks,
} = req.body;
console.log(req.body);
    const newProject = new Project({

  creator: req.user.id,

  title,
  description,
  overview,

  techStack,

  rolesNeeded,

  status,

  githubRepo,

  liveLink,

  difficulty,

  estimatedWeeks,

  members: [
    {
      user: req.user.id,
      role: "owner",
    },
  ],
});

   const savedProject = await newProject.save();

await Activity.create({
  project: savedProject._id,
  user: req.user.id,
  type: "project_created",
  message: `${req.user.name} created the project "${savedProject.title}"`,
});

res.status(201).json(savedProject);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * GET ALL PROJECTS
 */
export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("creator", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * GET SINGLE PROJECT
 */
export const getSingleProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("creator", "name email")
      .populate("members.user", "name email");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * REQUEST TO JOIN PROJECT
 */
export const requestToJoinProject = async (
  req,
  res
) => {
  try {
    const project = await Project.findById(
      req.params.id
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const userId = req.user.id;

    if (
      project.creator.toString() === userId
    ) {
      return res.status(400).json({
        message:
          "Project owner cannot send join request",
      });
    }

    const alreadyMember =
      project.members.some(
        (member) =>
          member.user.toString() === userId
      );

    if (alreadyMember) {
      return res.status(400).json({
        message:
          "You are already a member of this project",
      });
    }

    const alreadyRequested =
      project.joinRequests.some(
        (requestId) =>
          requestId.toString() === userId
      );

    if (alreadyRequested) {
      return res.status(400).json({
        message:
          "Join request already sent",
      });
    }

    project.joinRequests.push(userId);

    await project.save();

    await Notification.create({
      recipient: project.creator,
      sender: userId,
      type: "project_join_request",
      message:
        "A developer requested to join your project",
      relatedProject: project._id,
    });

    res.status(200).json({
      success: true,
      message:
        "Join request sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * INVITE DEVELOPER TO PROJECT
 */
export const inviteDeveloperToProject =
  async (req, res) => {
    try {
      const { projectId, userId } =
        req.params;

      const project =
        await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({
          message: "Project not found",
        });
      }
      const alreadyMember =
        project.members.some(
          (member) =>
            member.user.toString() === userId
        );

      if (alreadyMember) {
        return res.status(400).json({
          message:
            "User is already a project member",
        });
      }

      const alreadyInvited =
        project.pendingInvites.some(
          (invite) =>
            invite.user.toString() === userId
        );

      if (alreadyInvited) {
        return res.status(400).json({
          message:
            "Invite already sent",
        });
      }

      project.pendingInvites.push({
        user: userId,
      });

      await project.save();

      await Notification.create({
        recipient: userId,
        sender: req.user.id,
        type: "project_invite",
        message:
          "You have been invited to join a project",
        relatedProject: project._id,
      });

      return res.status(200).json({
        success: true,
        message:
          "Project invite sent successfully",
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  };
/**
 * ACCEPT PROJECT INVITE
 */
export const acceptProjectInvite = async (
  req,
  res
) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(
      projectId
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const userId = req.user.id;

    const inviteExists =
      project.pendingInvites.some(
        (invite) =>
          invite.user.toString() === userId
      );

    if (!inviteExists) {
      return res.status(404).json({
        message: "Invite not found",
      });
    }

    const alreadyMember =
      project.members.some(
        (member) =>
          member.user.toString() === userId
      );

    if (alreadyMember) {
      return res.status(400).json({
        message:
          "You are already a member of this project",
      });
    }

    project.pendingInvites =
      project.pendingInvites.filter(
        (invite) =>
          invite.user.toString() !== userId
      );

    project.members.push({
      user: userId,
      role: "member",
    });

    await project.save();

    await Notification.create({
      recipient: project.creator,
      sender: userId,
      type: "project_invite",
      message:
        "A developer accepted your project invite",
      relatedProject: project._id,
    });

    return res.status(200).json({
      success: true,
      message:
        "Project invite accepted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * REJECT PROJECT INVITE
 */
export const rejectProjectInvite = async (
  req,
  res
) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(
      projectId
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const userId = req.user.id;

    const inviteExists =
      project.pendingInvites.some(
        (invite) =>
          invite.user.toString() === userId
      );

    if (!inviteExists) {
      return res.status(404).json({
        message: "Invite not found",
      });
    }

    project.pendingInvites =
      project.pendingInvites.filter(
        (invite) =>
          invite.user.toString() !== userId
      );

    await project.save();

    return res.status(200).json({
      success: true,
      message:
        "Project invite rejected successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
/**
 * APPROVE JOIN REQUEST
 */
export const approveJoinRequest = async (
  req,
  res
) => {
  try {
    const { projectId, userId } = req.params;

    const project = await Project.findById(
      projectId
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }
    const requestExists =
      project.joinRequests.some(
        (id) => id.toString() === userId
      );

    if (!requestExists) {
      return res.status(404).json({
        message: "Join request not found",
      });
    }

    project.joinRequests =
      project.joinRequests.filter(
        (id) => id.toString() !== userId
      );

    project.members.push({
      user: userId,
      role: "member",
    });

    await project.save();

    await Notification.create({
      recipient: userId,
      sender: req.user.id,
      type: "project_invite",
      message:
        "Your join request has been approved",
      relatedProject: project._id,
    });

    return res.status(200).json({
      success: true,
      message:
        "Join request approved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * REJECT JOIN REQUEST
 */
export const rejectJoinRequest = async (
  req,
  res
) => {
  try {
    const { projectId, userId } = req.params;

    const project = await Project.findById(
      projectId
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    project.joinRequests =
      project.joinRequests.filter(
        (id) => id.toString() !== userId
      );

    await project.save();

    return res.status(200).json({
      success: true,
      message:
        "Join request rejected successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * DELETE PROJECT
 */
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

  

    await project.deleteOne();

    res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};
/**
 * PROJECT DASHBOARD ANALYTICS
 */
export const getProjectDashboard =
  async (req, res) => {
    try {
      const { projectId } = req.params;

      const project =
        await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      const tasks = await Task.find({
        project: projectId,
      });

      const totalTasks = tasks.length;

      const todoTasks = tasks.filter(
        (task) => task.status === "todo"
      ).length;

      const inProgressTasks =
        tasks.filter(
          (task) =>
            task.status === "in-progress"
        ).length;

      const reviewTasks = tasks.filter(
        (task) => task.status === "review"
      ).length;

      const completedTasks =
        tasks.filter(
          (task) =>
            task.status === "completed"
        ).length;

      const completionRate =
        totalTasks === 0
          ? 0
          : Math.round(
              (completedTasks /
                totalTasks) *
                100
            );

      return res.status(200).json({
        success: true,

        projectTitle: project.title,

        totalMembers:
          project.members.length,

        totalTasks,

        todoTasks,

        inProgressTasks,

        reviewTasks,

        completedTasks,

        completionRate,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  };
  /**
 * GET PROJECT ACTIVITY
 */
export const getProjectActivity = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const activities = await Activity.find({
      project: projectId,
    })
      .populate("user", "name email")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
/**
 * GET PROJECT MEMBERS
 */
export const getProjectMembers = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate(
        "members.user",
        "name email profilePicture headline"
      )
      .populate(
        "pendingInvites.user",
        "name email profilePicture headline"
      )
      .populate(
        "joinRequests",
        "name email profilePicture headline"
      );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
console.log(project.joinRequests);
    return res.status(200).json({
      success: true,
      members: project.members,
      pendingInvites: project.pendingInvites,
      joinRequests: project.joinRequests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/**
 * CHANGE MEMBER ROLE
 */
export const changeMemberRole = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const { role } = req.body;

    if (!["admin", "member"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const member = project.members.find(
      (member) => member.user.toString() === userId
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    if (member.role === "owner") {
      return res.status(400).json({
        success: false,
        message: "Owner role cannot be changed",
      });
    }

    member.role = role;

    await project.save();

    await Activity.create({
      project: project._id,
      user: req.user.id,
      type:
        role === "admin"
          ? "member_promoted"
          : "member_demoted",
      message: `${req.user.name} changed a member role to ${role}`,
    });

    await Notification.create({
      recipient: userId,
      sender: req.user.id,
      type: "project_role_updated",
      message: `Your role has been changed to ${role}`,
      relatedProject: project._id,
    });

    return res.status(200).json({
      success: true,
      message: "Member role updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const member = project.members.find(
      (m) => m.user.toString() === userId
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    if (member.role === "owner") {
      return res.status(400).json({
        success: false,
        message: "Owner cannot be removed",
      });
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== userId
    );

    await project.save();

    await Activity.create({
      project: project._id,
      user: req.user.id,
      type: "member_removed",
      message: `${req.user.name} removed a member from the project`,
    });

    await Notification.create({
      recipient: userId,
      sender: req.user.id,
      type: "project_member_removed",
      message: `You have been removed from "${project.title}"`,
      relatedProject: project._id,
    });

    return res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const leaveProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const member = project.members.find(
      (m) => m.user.toString() === req.user.id
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "You are not a member",
      });
    }

    if (member.role === "owner") {
      return res.status(400).json({
        success: false,
        message:
          "Transfer ownership before leaving the project",
      });
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== req.user.id
    );

    await project.save();

    await Activity.create({
      project: project._id,
      user: req.user.id,
      type: "member_removed",
      message: `${req.user.name} left the project`,
    });

    return res.status(200).json({
      success: true,
      message: "You left the project successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const searchDevelopers = async (req, res) => {
  try {
    const keyword = req.query.search || "";

    const users = await User.find({
      name: {
        $regex: keyword,
        $options: "i",
      },
    })
      .select("name email profilePicture headline")
      .limit(20);

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};