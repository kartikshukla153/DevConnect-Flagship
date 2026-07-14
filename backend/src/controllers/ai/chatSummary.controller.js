import axios from "axios";
import Conversation from "../../models/Conversation.js";
import Message from "../../models/Message.js";

export const summarizeChat = async (req, res) => {
  try {
    const { conversationId } = req.body;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const messages = await Message.find({
      conversation: conversationId,
      deleted: false,
    })
      .populate("sender", "name")
      .sort({ createdAt: 1 });

    if (!messages.length) {
      return res.json({
        summary: "No messages found.",
      });
    }

    // Keep only latest 30 messages to reduce prompt size
    const recentMessages = messages.slice(-30);

    const transcript = recentMessages
      .map(
        (m) =>
          `${m.sender?.name || "User"}: ${
            m.text?.trim() || "[Attachment]"
          }`
      )
      .join("\n");

    console.log("Conversation ID:", conversationId);
    console.log("Messages Sent:", recentMessages.length);

    const prompt = `
You are an AI assistant.

Summarize this developer conversation in 5-8 concise bullet points.

Mention:
- Main discussion
- Important decisions
- Action items
- Files shared
- Overall outcome

Conversation:

${transcript}
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "qwen/qwen3-coder",

        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],

        temperature: 0.2,

        // IMPORTANT
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "DevConnect",
        },
      }
    );

    const summary =
      response.data.choices?.[0]?.message?.content ||
      "No summary generated.";

    return res.json({
      success: true,
      summary,
    });
  } catch (err) {
    console.log(
      "OPENROUTER ERROR:",
      err.response?.data || err.message
    );

    return res.status(500).json({
      success: false,
      message: "Summary generation failed",
    });
  }
};