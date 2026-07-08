import Project from "../models/project.js";
import ProjectMessage from "../models/ProjectMessage.js";
import { getIO } from "../socket/socket.js";
/**
 * SEND PROJECT MESSAGE
 */
export const sendProjectMessage = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { message } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const member = project.members.find(
      (member) =>
        member.user.toString() === req.user._id.toString()
    );

    if (!member) {
      return res.status(403).json({
        message: "Only project members can send messages",
      });
    }

    const newMessage = await ProjectMessage.create({
      project: projectId,
      sender: req.user._id,
      message,
    });

    const populatedMessage =
      await ProjectMessage.findById(newMessage._id)
        .populate("sender", "name email");
        getIO()
  .to(projectId)
  .emit(
    "new_project_message",
    populatedMessage
  );

    return res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * GET PROJECT CHAT
 */
export const getProjectMessages = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const member = project.members.find(
      (member) =>
        member.user.toString() === req.user._id.toString()
    );

    if (!member) {
      return res.status(403).json({
        message:
          "Only project members can view chat",
      });
    }

    const messages = await ProjectMessage.find({
      project: projectId,
    })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};