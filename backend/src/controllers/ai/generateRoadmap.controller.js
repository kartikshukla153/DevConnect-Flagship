
import { generateWithAI } from "../../services/ai.service.js";
import { projectArchitectPrompt } from "../../prompts/projectArchitect.prompt.js";
import { parseRoadmap } from "../../utils/parseRoadmap.js";
import { createProjectFromRoadmap } from "../../services/projectCreation.service.js";

export const generateRoadmap = async (req, res) => {
  try {
    const idea =
      typeof req.body?.idea === "string"
        ? req.body.idea.trim()
        : "";

    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!idea) {
      return res.status(400).json({
        success: false,
        message: "Describe the product you want to build.",
      });
    }

    if (idea.length > 3000) {
      return res.status(400).json({
        success: false,
        message: "Your project idea must not exceed 3000 characters.",
      });
    }

    const aiResponse = await generateWithAI(
      projectArchitectPrompt(idea)
    );

    const roadmap = parseRoadmap(aiResponse);

    // Keep the project title useful instead of storing an entire
    // long product description as its title.
    const title =
      idea
        .replace(/\s+/g, " ")
        .slice(0, 117)
        .trim()
        .replace(/[\s.,;:!?-]+$/, "") || "AI-generated project";

    const result = await createProjectFromRoadmap({
      roadmap,
      creatorId: req.user._id,
      title,
    });

    return res.status(201).json({
      success: true,
      roadmap,
      project: result.project,
      tasksCreated: result.tasks.length,
    });
  } catch (error) {
    console.error("AI roadmap generation failed:", {
      message: error.message,
    });

    const validationMessages = new Set([
      "AI returned an empty roadmap.",
      "AI returned invalid roadmap JSON.",
      "Roadmap must be a JSON object.",
      "Roadmap overview is missing or invalid.",
      "Roadmap difficulty is invalid.",
      "Roadmap duration must be between 1 and 104 weeks.",
      "Roadmap technology stack is invalid.",
      "A roadmap milestone is invalid.",
      "A roadmap task is invalid.",
    ]);

    if (validationMessages.has(error.message)) {
      return res.status(502).json({
        success: false,
        message: "The AI returned an invalid roadmap. Please try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to generate the project roadmap right now.",
    });
  }
};
