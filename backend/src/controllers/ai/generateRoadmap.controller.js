import { generateWithAI } from "../../services/ai.service.js";
import { projectArchitectPrompt } from "../../prompts/projectArchitect.prompt.js";
import { parseRoadmap } from "../../utils/parseRoadmap.js";
import { createProjectFromRoadmap } from "../../services/projectCreation.service.js";

export const generateRoadmap = async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea) {
      return res.status(400).json({
        success: false,
        message: "Idea is required",
      });
    }

    // Generate AI Prompt
    const prompt = projectArchitectPrompt(idea);

    // Get AI Response
    const aiResponse = await generateWithAI(prompt);

    // Convert AI JSON string into JS Object
    const roadmap = parseRoadmap(aiResponse);

    // Create Project + Tasks in Database
    const result = await createProjectFromRoadmap({
      roadmap,
      creatorId: req.user.id,
      title: idea,
    });

    return res.status(200).json({
      success: true,
      roadmap,
      project: result.project,
      tasksCreated: result.tasks.length,
    });
  } catch (err) {
    console.error("========== AI ROADMAP ERROR ==========");
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message || "Roadmap generation failed",
    });
  }
};