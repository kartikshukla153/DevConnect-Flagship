import Invitation from "../models/Invitation.js";
import Project from "../models/project.js";
import User from "../models/User.js";
import Activity from "../models/Activity.js";

export const sendInvitation = async (req, res) => {
  try {
    const { projectId, receiverId, role } = req.body;

    const project = await Project.findById(projectId);

    if (!project)
      return res.status(404).json({
        message: "Project not found",
      });

    const receiver = await User.findById(receiverId);

    if (!receiver)
      return res.status(404).json({
        message: "User not found",
      });

    const alreadyMember = project.members.find(
      (m) => m.user.toString() === receiverId
    );

    if (alreadyMember)
      return res.status(400).json({
        message: "Already a member",
      });

    const exists = await Invitation.findOne({
      project: projectId,
      receiver: receiverId,
      status: "pending",
    });

    if (exists)
      return res.status(400).json({
        message: "Invitation already exists",
      });

    const invitation = await Invitation.create({
      project: projectId,
      sender: req.user._id,
      receiver: receiverId,
      role,
    });

    await Activity.create({
      project: projectId,
      user: req.user._id,
      type: "member_invited",
      message: `${req.user.name} invited ${receiver.name}`,
    });

    res.status(201).json({
      success: true,
      invitation,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const getMyInvitations = async (req, res) => {
  const invitations = await Invitation.find({
    receiver: req.user._id,
    status: "pending",
  })
    .populate("project", "title")
    .populate("sender", "name");

  res.json({
    success: true,
    invitations,
  });
};

export const acceptInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation)
      return res.status(404).json({
        message: "Invitation not found",
      });

    if (
      invitation.receiver.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    invitation.status = "accepted";

    await invitation.save();

    const project = await Project.findById(invitation.project);

    project.members.push({
      user: req.user._id,
      role: invitation.role,
    });

    await project.save();

    await Activity.create({
      project: project._id,
      user: req.user._id,
      type: "member_joined",
      message: `${req.user.name} joined the project`,
    });

    res.json({
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const rejectInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation)
      return res.status(404).json({
        message: "Invitation not found",
      });

    invitation.status = "rejected";

    await invitation.save();

    res.json({
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { projectId, memberId } = req.body;

    await Project.findByIdAndUpdate(projectId, {
      $pull: {
        members: {
          user: memberId,
        },
      },
    });

    res.json({
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { projectId, memberId, role } = req.body;

    const project = await Project.findById(projectId);

    const member = project.members.find(
      (m) => m.user.toString() === memberId
    );

    if (member) {
      member.role = role;
    }

    await project.save();

    res.json({
      success: true,
      project,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};