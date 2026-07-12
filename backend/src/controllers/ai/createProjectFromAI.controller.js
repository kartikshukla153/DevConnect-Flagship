import { generateWithAI } from "../../services/ai.service.js";
import { projectArchitectPrompt } from "../../prompts/projectArchitect.prompt.js";
import { parseRoadmap } from "../../utils/parseRoadmap.js";

import { createProjectFromRoadmap } from "../../services/projectCreation.service.js";

export const createProjectFromAI = async (
  req,
  res
) => {
  try {
    const { idea } = req.body;

    if (!idea) {
      return res.status(400).json({
        success: false,
        message: "Idea required",
      });
    }

    const prompt = projectArchitectPrompt(idea);

    const aiResponse =
      await generateWithAI(prompt);

    const roadmap =
      parseRoadmap(aiResponse);

    const result =
      await createProjectFromRoadmap({
        roadmap,

        creatorId: req.user._id,

        title: idea,
      });

    return res.json({
      success: true,

      roadmap,

      project: result.project,

      tasks: result.tasks,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,

      message: err.message,
    });
  }
};