
const MAX_MILESTONES = 12;
const MAX_TASKS = 60;
const MAX_TITLE_LENGTH = 120;
const MAX_OVERVIEW_LENGTH = 4000;
const MAX_TASK_TITLE_LENGTH = 180;
const MAX_TECH_STACK_ITEMS = 20;

export const parseRoadmap = (text) => {
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("AI returned an empty roadmap.");
  }

  let roadmap;

  try {
    const cleaned = text
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    roadmap = JSON.parse(cleaned);
  } catch {
    throw new Error("AI returned invalid roadmap JSON.");
  }

  if (
    !roadmap ||
    typeof roadmap !== "object" ||
    Array.isArray(roadmap)
  ) {
    throw new Error("Roadmap must be a JSON object.");
  }

  if (
    typeof roadmap.overview !== "string" ||
    !roadmap.overview.trim() ||
    roadmap.overview.length > MAX_OVERVIEW_LENGTH
  ) {
    throw new Error("Roadmap overview is missing or invalid.");
  }

  if (
    typeof roadmap.difficulty !== "string" ||
    !["Beginner", "Intermediate", "Advanced"].includes(
      roadmap.difficulty.trim()
    )
  ) {
    throw new Error("Roadmap difficulty is invalid.");
  }

  if (
    !Number.isInteger(roadmap.estimatedWeeks) ||
    roadmap.estimatedWeeks < 1 ||
    roadmap.estimatedWeeks > 104
  ) {
    throw new Error("Roadmap duration must be between 1 and 104 weeks.");
  }

  if (
    !Array.isArray(roadmap.techStack) ||
    roadmap.techStack.length > MAX_TECH_STACK_ITEMS ||
    roadmap.techStack.some(
      (item) =>
        typeof item !== "string" ||
        !item.trim() ||
        item.length > 60
    )
  ) {
    throw new Error("Roadmap technology stack is invalid.");
  }

  if (
    !Array.isArray(roadmap.milestones) ||
    roadmap.milestones.length < 1 ||
    roadmap.milestones.length > MAX_MILESTONES
  ) {
    throw new Error(
      `Roadmap must contain between 1 and ${MAX_MILESTONES} milestones.`
    );
  }

  let taskCount = 0;

  const milestones = roadmap.milestones.map((milestone) => {
    if (
      !milestone ||
      typeof milestone.title !== "string" ||
      !milestone.title.trim() ||
      milestone.title.length > MAX_TITLE_LENGTH ||
      !Array.isArray(milestone.tasks) ||
      milestone.tasks.length < 1
    ) {
      throw new Error("A roadmap milestone is invalid.");
    }

    const tasks = milestone.tasks.map((task) => {
      if (
        typeof task !== "string" ||
        !task.trim() ||
        task.length > MAX_TASK_TITLE_LENGTH
      ) {
        throw new Error("A roadmap task is invalid.");
      }

      taskCount += 1;
      return task.trim();
    });

    return {
      title: milestone.title.trim(),
      tasks,
    };
  });

  if (taskCount > MAX_TASKS) {
    throw new Error(
      `Roadmap cannot contain more than ${MAX_TASKS} tasks.`
    );
  }

  return {
    overview: roadmap.overview.trim(),
    difficulty: roadmap.difficulty.trim(),
    estimatedWeeks: roadmap.estimatedWeeks,
    techStack: [
      ...new Set(roadmap.techStack.map((item) => item.trim())),
    ],
    milestones,
  };
};
