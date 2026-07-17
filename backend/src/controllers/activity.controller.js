import Activity from "../models/Activity.js";

export const getProjectActivity = async (
  req,
  res
) => {
  try {
    const { projectId } = req.params;

    const activity = await Activity.find({
      project: projectId,
    })
      .populate("user", "name profilePicture")
      .sort({
        createdAt: -1,
      })
      .limit(40);

    res.json(activity);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};