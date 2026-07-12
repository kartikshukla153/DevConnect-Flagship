import Message from "../../models/Message.js";
import Conversation from "../../models/Conversation.js";

export const searchMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { q } = req.query;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant = conversation.participants.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const messages = await Message.find({
      conversation: conversationId,
      text: {
        $regex: q,
        $options: "i",
      },
    })
      .populate("sender", "name profilePicture")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      messages,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};