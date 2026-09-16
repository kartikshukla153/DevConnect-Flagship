import mongoose from "mongoose";
import axios from "axios";

import Project from "../models/project.js";
import Notification from "../models/Notification.js";
import Task from "../models/Task.js";
import Activity from "../models/Activity.js";
import User from "../models/User.js";

import { emitProjectMemberJoined } from "../socket/socket.js";

/*
===========================================================
PROJECT CONTROLLER
===========================================================

Engineering principles:

1. Authentication is never trusted from the client.
2. Authorization is enforced server-side.
3. ObjectIds are validated before database operations.
4. Public endpoints do not expose private project/member data.
5. Core business mutations are completed before secondary
   systems such as notifications are attempted.
6. Realtime events are emitted only after persistence.
7. Database errors are logged server-side, not exposed.
8. Existing API response contracts are preserved.
9. Project/member/task relationships remain consistent.
10. Validation prevents malformed state from entering MongoDB.
===========================================================
*/

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_OVERVIEW_LENGTH = 10000;
const MAX_TECH_STACK_ITEMS = 30;
const MAX_TECH_STACK_ITEM_LENGTH = 80;
const MAX_ROLES_ITEMS = 20;
const MAX_ROLE_LENGTH = 100;
const MAX_WEEKS = 520;

const ALLOWED_PROJECT_STATUSES = [
  "open",
  "closed",
  "in-progress",
];

const ALLOWED_DIFFICULTIES = [
  "beginner",
  "easy",
  "medium",
  "hard",
  "advanced",
  "expert",
];

const ALLOWED_MEMBER_ROLES = [
  "admin",
  "member",
];

/* =========================================================
   GENERIC HELPERS
========================================================= */

const isValidObjectId = (value) => {
  return mongoose.isValidObjectId(value);
};

const normalizeString = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const normalizeOptionalString = (value) => {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return normalizeString(value);
};

const normalizeArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item) =>
        typeof item === "string"
    )
    .map((item) => item.trim())
    .filter(Boolean);
};

const getUserId = (req) => {
  return req.user?._id?.toString() || null;
};

const requireAuthenticatedUser = (
  req,
  res
) => {
  if (!req.user?._id) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });

    return false;
  }

  return true;
};

const getSafeErrorMessage = (
  error,
  fallback
) => {
  if (
    error?.name === "ValidationError" ||
    error?.name === "CastError"
  ) {
    return "Invalid request data";
  }

  return fallback;
};

const findProject = async (projectId) => {
  if (
    !projectId ||
    !isValidObjectId(projectId)
  ) {
    const error = new Error(
      "INVALID_PROJECT_ID"
    );

    error.code = "INVALID_PROJECT_ID";

    throw error;
  }

  const project =
    await Project.findById(projectId);

  if (!project) {
    const error = new Error(
      "PROJECT_NOT_FOUND"
    );

    error.code = "PROJECT_NOT_FOUND";

    throw error;
  }

  return project;
};

const getProjectMember = (
  project,
  userId
) => {
  if (!project || !userId) {
    return null;
  }

  return (
    project.members.find(
      (member) =>
        member.user?.toString() ===
        userId.toString()
    ) || null
  );
};

const isProjectMember = (
  project,
  userId
) => {
  return Boolean(
    getProjectMember(
      project,
      userId
    )
  );
};

const isProjectOwner = (
  project,
  userId
) => {
  if (!project || !userId) {
    return false;
  }

  return (
    project.creator?.toString() ===
    userId.toString()
  );
};

const hasProjectRole = (
  project,
  userId,
  roles
) => {
  const member =
    getProjectMember(
      project,
      userId
    );

  return Boolean(
    member &&
      roles.includes(member.role)
  );
};

/*
===========================================================
ACTIVITY

Activity is an audit/history feature. It must never cause a
successful core business mutation to become a failure.
===========================================================
*/

async function createActivity({
  project,
  user,
  type,
  message,
}) {
  try {
    await Activity.create({
      project,
      user,
      type,
      message,
    });
  } catch (error) {
    console.error(
      "Activity creation failed:",
      error
    );
  }
}

/*
===========================================================
NOTIFICATION

Notifications are secondary to the core mutation.

If notification persistence fails, the project state should
remain successful and consistent.
===========================================================
*/

async function createNotification({
  recipient,
  sender,
  type,
  message,
  relatedProject = null,
}) {
  try {
    await Notification.create({
      recipient,
      sender,
      type,
      message,
      relatedProject,
    });
  } catch (error) {
    console.error(
      "Notification creation failed:",
      error
    );
  }
}

/*
===========================================================
PROJECT RESPONSE SANITIZATION

Public project responses should not expose:
- pending invitations
- join requests

Those are private workflow state.
===========================================================
*/

const sanitizePublicProject = (
  project
) => {
  const data = project.toObject
    ? project.toObject()
    : { ...project };

  delete data.pendingInvites;
  delete data.joinRequests;

  return data;
};

/*
===========================================================
PROJECT INPUT VALIDATION
===========================================================
*/

const validateProjectFields = ({
  title,
  description,
  overview,
  techStack,
  rolesNeeded,
  status,
  estimatedWeeks,
  difficulty,
}) => {
  const normalizedTitle =
    normalizeString(title);

  const normalizedDescription =
    normalizeString(description);

  const normalizedOverview =
    normalizeOptionalString(
      overview
    );

  if (!normalizedTitle) {
    return {
      error: "Project title is required",
    };
  }

  if (
    normalizedTitle.length >
    MAX_TITLE_LENGTH
  ) {
    return {
      error: `Project title cannot exceed ${MAX_TITLE_LENGTH} characters`,
    };
  }

  if (!normalizedDescription) {
    return {
      error:
        "Project description is required",
    };
  }

  if (
    normalizedDescription.length >
    MAX_DESCRIPTION_LENGTH
  ) {
    return {
      error: `Project description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`,
    };
  }

  if (
    normalizedOverview.length >
    MAX_OVERVIEW_LENGTH
  ) {
    return {
      error: `Project overview cannot exceed ${MAX_OVERVIEW_LENGTH} characters`,
    };
  }

  const normalizedTechStack =
    normalizeArray(techStack);

  if (
    normalizedTechStack.length >
    MAX_TECH_STACK_ITEMS
  ) {
    return {
      error: `Tech stack cannot contain more than ${MAX_TECH_STACK_ITEMS} items`,
    };
  }

  if (
    normalizedTechStack.some(
      (item) =>
        item.length >
        MAX_TECH_STACK_ITEM_LENGTH
    )
  ) {
    return {
      error: `Each technology cannot exceed ${MAX_TECH_STACK_ITEM_LENGTH} characters`,
    };
  }

  const normalizedRoles =
    normalizeArray(rolesNeeded);

  if (
    normalizedRoles.length >
    MAX_ROLES_ITEMS
  ) {
    return {
      error: `Roles cannot contain more than ${MAX_ROLES_ITEMS} items`,
    };
  }

  if (
    normalizedRoles.some(
      (role) =>
        role.length > MAX_ROLE_LENGTH
    )
  ) {
    return {
      error: `Each role cannot exceed ${MAX_ROLE_LENGTH} characters`,
    };
  }

  if (
    status !== undefined &&
    status !== null &&
    !ALLOWED_PROJECT_STATUSES.includes(
      status
    )
  ) {
    return {
      error: "Invalid project status",
    };
  }

  if (
    difficulty !== undefined &&
    difficulty !== null &&
    difficulty !== "" &&
    !ALLOWED_DIFFICULTIES.includes(
      difficulty
    )
  ) {
    return {
      error: "Invalid project difficulty",
    };
  }

  if (
    estimatedWeeks !== undefined &&
    estimatedWeeks !== null &&
    estimatedWeeks !== ""
  ) {
    const weeks =
      Number(estimatedWeeks);

    if (
      !Number.isFinite(weeks) ||
      !Number.isInteger(weeks) ||
      weeks < 0 ||
      weeks > MAX_WEEKS
    ) {
      return {
        error: `Estimated weeks must be an integer between 0 and ${MAX_WEEKS}`,
      };
    }
  }

  return {
    value: {
      title: normalizedTitle,
      description:
        normalizedDescription,
      overview: normalizedOverview,
      techStack:
        normalizedTechStack,
      rolesNeeded:
        normalizedRoles,
      status:
        status || "open",
      estimatedWeeks:
        estimatedWeeks === undefined ||
        estimatedWeeks === null ||
        estimatedWeeks === ""
          ? 0
          : Number(estimatedWeeks),
      difficulty:
        normalizeOptionalString(
          difficulty
        ),
    },
  };
};

/*
===========================================================
URL VALIDATION
===========================================================
*/

const isValidHttpUrl = (
  value
) => {
  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
};

const parseGitHubRepositoryUrl = (
  repositoryUrl
) => {
  const normalized =
    normalizeString(
      repositoryUrl
    );

  if (!normalized) {
    return null;
  }

  let parsed;

  try {
    parsed = new URL(normalized);
  } catch {
    return null;
  }

  if (
    parsed.protocol !== "https:" ||
    parsed.hostname.toLowerCase() !==
      "github.com"
  ) {
    return null;
  }

  const parts =
    parsed.pathname
      .replace(/^\/+|\/+$/g, "")
      .split("/")
      .filter(Boolean);

  if (parts.length !== 2) {
    return null;
  }

  const owner =
    parts[0].replace(/\.git$/i, "");

  const repo =
    parts[1].replace(/\.git$/i, "");

  if (!owner || !repo) {
    return null;
  }

  return {
    owner,
    repo,
    url: normalized,
  };
};

/*
===========================================================
CREATE PROJECT
===========================================================
*/

export const createProject = async (
  req,
  res
) => {
  try {
    if (
      !requireAuthenticatedUser(
        req,
        res
      )
    ) {
      return;
    }

    const {
      title,
      description,
      overview,
      techStack,
      rolesNeeded,
      status,
      githubRepo,
      liveLink,
      estimatedWeeks,
      difficulty,
    } = req.body || {};

    const validation =
      validateProjectFields({
        title,
        description,
        overview,
        techStack,
        rolesNeeded,
        status,
        estimatedWeeks,
        difficulty,
      });

    if (validation.error) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const normalizedGithubRepo =
      normalizeOptionalString(
        githubRepo
      );

    const normalizedLiveLink =
      normalizeOptionalString(
        liveLink
      );

    if (
      normalizedGithubRepo &&
      !isValidHttpUrl(
        normalizedGithubRepo
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid GitHub repository URL",
      });
    }

    if (
      normalizedLiveLink &&
      !isValidHttpUrl(
        normalizedLiveLink
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid live URL",
      });
    }

    const project =
      await Project.create({
        creator: req.user._id,

        ...validation.value,

        githubRepo:
          normalizedGithubRepo,

        liveLink:
          normalizedLiveLink,

        members: [
          {
            user: req.user._id,
            role: "owner",
          },
        ],

        pendingInvites: [],
        joinRequests: [],
      });

    await createActivity({
      project: project._id,
      user: req.user._id,
      type: "project_created",
      message: `${req.user.name} created the project`,
    });

    return res.status(201).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error(
      "CREATE PROJECT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: getSafeErrorMessage(
        error,
        "Unable to create project"
      ),
    });
  }
};

/*
===========================================================
GET ALL PROJECTS

This is a discovery endpoint.

Do not expose:
- email addresses
- pending invitations
- join requests
===========================================================
*/

export const getAllProjects = async (
  req,
  res
) => {
  try {
    const projects =
      await Project.find()
        .populate(
          "creator",
          "name profilePicture headline"
        )
        .populate(
          "members.user",
          "name profilePicture headline"
        )
        .select(
          "-pendingInvites -joinRequests"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error(
      "GET ALL PROJECTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load projects",
    });
  }
};

/*
===========================================================
GET SINGLE PROJECT

Public project details contain only public project/member
information.

Private invitation/request workflow state is excluded.
===========================================================
*/

export const getSingleProject =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !isValidObjectId(id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid project ID",
        });
      }

      const project =
        await Project.findById(id)
          .populate(
            "creator",
            "name profilePicture headline"
          )
          .populate(
            "members.user",
            "name profilePicture headline skills"
          )
          .select(
            "-pendingInvites -joinRequests"
          );

      if (!project) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found",
        });
      }

      return res.status(200).json({
        success: true,
        project,
      });
    } catch (error) {
      console.error(
        "GET SINGLE PROJECT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load project",
      });
    }
  };

/*
===========================================================
REQUEST TO JOIN PROJECT
===========================================================
*/

export const requestToJoinProject =
  async (req, res) => {
    try {
      if (
        !requireAuthenticatedUser(
          req,
          res
        )
      ) {
        return;
      }

      const {
        id: projectId,
      } = req.params;

      if (
        !isValidObjectId(
          projectId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid project ID",
        });
      }

      const project =
        await Project.findById(
          projectId
        );

      if (!project) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found",
        });
      }

      const userId =
        getUserId(req);

      if (
        isProjectMember(
          project,
          userId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You are already a member of this project",
        });
      }

      if (
        project.status === "closed"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This project is not accepting join requests",
        });
      }

      const alreadyRequested =
        project.joinRequests.some(
          (user) =>
            user.toString() ===
            userId
        );

      if (alreadyRequested) {
        return res.status(400).json({
          success: false,
          message:
            "Join request already sent",
        });
      }

      const alreadyInvited =
        project.pendingInvites.some(
          (invite) =>
            invite.user?.toString() ===
            userId
        );

      if (alreadyInvited) {
        return res.status(400).json({
          success: false,
          message:
            "You already have a pending invitation",
        });
      }

      project.joinRequests.push(
        req.user._id
      );

      await project.save();

      await createNotification({
        recipient:
          project.creator,
        sender:
          req.user._id,
        type:
          "project_join_request",
        message: `${req.user.name} requested to join your project`,
        relatedProject:
          project._id,
      });

      await createActivity({
        project:
          project._id,
        user:
          req.user._id,
        type:
          "join_request",
        message: `${req.user.name} requested to join the project`,
      });

      return res.status(200).json({
        success: true,
        message:
          "Join request sent successfully",
      });
    } catch (error) {
      console.error(
        "REQUEST TO JOIN PROJECT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to send join request",
      });
    }
  };

/*
===========================================================
APPROVE JOIN REQUEST
===========================================================
*/

export const approveJoinRequest =
  async (req, res) => {
    try {
      if (
        !requireAuthenticatedUser(
          req,
          res
        )
      ) {
        return;
      }

      const {
        projectId,
        userId,
      } = req.params;

      if (
        !isValidObjectId(
          projectId
        ) ||
        !isValidObjectId(userId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid project or user ID",
        });
      }

      const project =
        await Project.findById(
          projectId
        );

      if (!project) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found",
        });
      }

      if (
        !hasProjectRole(
          project,
          req.user._id,
          ["owner", "admin"]
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only owner or admin can approve join requests",
        });
      }

      const requestExists =
        project.joinRequests.some(
          (user) =>
            user.toString() ===
            userId
        );

      if (!requestExists) {
        return res.status(404).json({
          success: false,
          message:
            "Join request not found",
        });
      }

      const alreadyMember =
        isProjectMember(
          project,
          userId
        );

      if (!alreadyMember) {
        project.members.push({
          user: userId,
          role: "member",
        });
      }

      project.joinRequests =
        project.joinRequests.filter(
          (user) =>
            user.toString() !==
            userId
        );

      project.pendingInvites =
        project.pendingInvites.filter(
          (invite) =>
            invite.user?.toString() !==
            userId
        );

      await project.save();

      await createNotification({
        recipient: userId,
        sender:
          req.user._id,
        type:
          "project_invite",
        message: `Your request to join "${project.title}" was accepted`,
        relatedProject:
          project._id,
      });

      await createActivity({
        project:
          project._id,
        user:
          req.user._id,
        type:
          "member_joined",
        message: `${req.user.name} approved a join request`,
      });

      emitProjectMemberJoined(
        project._id,
        {
          user: userId,
          role: "member",
        }
      );

      return res.status(200).json({
        success: true,
        message:
          "Join request approved",
      });
    } catch (error) {
      console.error(
        "APPROVE JOIN REQUEST ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to approve join request",
      });
    }
  };

/*
===========================================================
REJECT JOIN REQUEST
===========================================================
*/

export const rejectJoinRequest =
  async (req, res) => {
    try {
      if (
        !requireAuthenticatedUser(
          req,
          res
        )
      ) {
        return;
      }

      const {
        projectId,
        userId,
      } = req.params;

      if (
        !isValidObjectId(
          projectId
        ) ||
        !isValidObjectId(userId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid project or user ID",
        });
      }

      const project =
        await Project.findById(
          projectId
        );

      if (!project) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found",
        });
      }

      if (
        !hasProjectRole(
          project,
          req.user._id,
          ["owner", "admin"]
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only owner or admin can reject join requests",
        });
      }

      const requestExists =
        project.joinRequests.some(
          (user) =>
            user.toString() ===
            userId
        );

      if (!requestExists) {
        return res.status(404).json({
          success: false,
          message:
            "Join request not found",
        });
      }

      project.joinRequests =
        project.joinRequests.filter(
          (user) =>
            user.toString() !==
            userId
        );

      await project.save();

      await createNotification({
        recipient: userId,
        sender:
          req.user._id,
        type:
          "connection_rejected",
        message: `Your request to join "${project.title}" was rejected`,
        relatedProject:
          project._id,
      });

      await createActivity({
        project:
          project._id,
        user:
          req.user._id,
        type:
          "join_request_rejected",
        message: `${req.user.name} rejected a join request`,
      });

      return res.status(200).json({
        success: true,
        message:
          "Join request rejected",
      });
    } catch (error) {
      console.error(
        "REJECT JOIN REQUEST ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to reject join request",
      });
    }
  };

/*
===========================================================
INVITE DEVELOPER
===========================================================
*/

export const inviteDeveloperToProject =
  async (req, res) => {
    try {
      if (
        !requireAuthenticatedUser(
          req,
          res
        )
      ) {
        return;
      }

      const {
        projectId,
        userId,
      } = req.params;

      if (
        !isValidObjectId(
          projectId
        ) ||
        !isValidObjectId(userId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid project or user ID",
        });
      }

      const project =
        await Project.findById(
          projectId
        );

      if (!project) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found",
        });
      }

      if (
        !hasProjectRole(
          project,
          req.user._id,
          ["owner", "admin"]
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only owner or admin can invite developers",
        });
      }

      const targetUser =
        await User.findById(
          userId
        ).select(
          "_id name"
        );

      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message:
            "Developer not found",
        });
      }

      if (
        targetUser._id.toString() ===
        req.user._id.toString()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You cannot invite yourself",
        });
      }

      if (
        isProjectMember(
          project,
          userId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Developer is already a member of this project",
        });
      }

      const inviteExists =
        project.pendingInvites.some(
          (invite) =>
            invite.user?.toString() ===
            userId
        );

      if (inviteExists) {
        return res.status(400).json({
          success: false,
          message:
            "Invitation already sent",
        });
      }

      const joinRequestExists =
        project.joinRequests.some(
          (user) =>
            user.toString() ===
            userId
        );

      if (joinRequestExists) {
        project.joinRequests =
          project.joinRequests.filter(
            (user) =>
              user.toString() !==
              userId
          );
      }

      /*
        The current Project schema intentionally contains only:
        user + invitedAt.

        Do not write undeclared fields such as invitedBy here.
      */
      project.pendingInvites.push({
        user: userId,
        invitedAt:
          new Date(),
      });

      await project.save();

      await createNotification({
        recipient: userId,
        sender:
          req.user._id,
        type:
          "project_invite",
        message: `${req.user.name} invited you to join "${project.title}"`,
        relatedProject:
          project._id,
      });

      await createActivity({
        project:
          project._id,
        user:
          req.user._id,
        type:
          "invite_sent",
        message: `${req.user.name} invited ${targetUser.name} to join the project`,
      });

      return res.status(200).json({
        success: true,
        message:
          "Developer invited successfully",
      });
    } catch (error) {
      console.error(
        "INVITE DEVELOPER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to invite developer",
      });
    }
  };

/*
===========================================================
ACCEPT PROJECT INVITE
===========================================================
*/

export const acceptProjectInvite =
  async (req, res) => {
    try {
      if (
        !requireAuthenticatedUser(
          req,
          res
        )
      ) {
        return;
      }

      const {
        projectId,
      } = req.params;

      const userId =
        getUserId(req);

      if (
        !isValidObjectId(
          projectId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid project ID",
        });
      }

      const project =
        await Project.findById(
          projectId
        );

      if (!project) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found",
        });
      }

      const inviteExists =
        project.pendingInvites.some(
          (invite) =>
            invite.user?.toString() ===
            userId
        );

      if (!inviteExists) {
        return res.status(404).json({
          success: false,
          message:
            "Invite not found",
        });
      }

      if (
        isProjectMember(
          project,
          userId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You are already a member of this project",
        });
      }

      /*
        Remove invitation and create membership in the same
        project document mutation.
      */
      project.pendingInvites =
        project.pendingInvites.filter(
          (invite) =>
            invite.user?.toString() !==
            userId
        );

      project.members.push({
        user: userId,
        role: "member",
      });

      await project.save();

      /*
        IMPORTANT:
        Persistence happens before realtime delivery.
      */
      try {
        emitProjectMemberJoined(
          project._id,
          {
            user: userId,
            role: "member",
          }
        );
      } catch (socketError) {
        console.error(
          "PROJECT MEMBER SOCKET EVENT FAILED:",
          socketError
        );
      }

      await createNotification({
        recipient:
          project.creator,
        sender:
          userId,
        type:
          "project_invite",
        message:
          "A developer accepted your project invite",
        relatedProject:
          project._id,
      });

      await createActivity({
        project:
          project._id,
        user:
          userId,
        type:
          "invite_accepted",
        message: `${req.user.name} accepted the project invitation`,
      });

      await createActivity({
        project:
          project._id,
        user:
          userId,
        type:
          "member_joined",
        message: `${req.user.name} joined the project`,
      });

      return res.status(200).json({
        success: true,
        message:
          "Project invite accepted successfully",
      });
    } catch (error) {
      console.error(
        "ACCEPT PROJECT INVITE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to accept project invitation",
      });
    }
  };

/*
===========================================================
REJECT PROJECT INVITE
===========================================================
*/

export const rejectProjectInvite =
  async (req, res) => {
    try {
      if (
        !requireAuthenticatedUser(
          req,
          res
        )
      ) {
        return;
      }

      const {
        projectId,
      } = req.params;

      const userId =
        getUserId(req);

      if (
        !isValidObjectId(
          projectId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid project ID",
        });
      }

      const project =
        await Project.findById(
          projectId
        );

      if (!project) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found",
        });
      }

      const inviteExists =
        project.pendingInvites.some(
          (invite) =>
            invite.user?.toString() ===
            userId
        );

      if (!inviteExists) {
        return res.status(404).json({
          success: false,
          message:
            "Invite not found",
        });
      }

      project.pendingInvites =
        project.pendingInvites.filter(
          (invite) =>
            invite.user?.toString() !==
            userId
        );

      await project.save();

      await createActivity({
        project:
          project._id,
        user:
          userId,
        type:
          "invite_rejected",
        message: `${req.user.name} rejected the project invitation`,
      });

      return res.status(200).json({
        success: true,
        message:
          "Project invite rejected successfully",
      });
    } catch (error) {
      console.error(
        "REJECT PROJECT INVITE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to reject project invitation",
      });
    }
  };

/*
===========================================================
DELETE PROJECT

Uses a MongoDB transaction so project deletion and its
dependent Task / Notification / Activity records do not
silently diverge.

MongoDB Atlas supports transactions.
===========================================================
*/

export const deleteProject =
  async (req, res) => {
    const session =
      await mongoose.startSession();

    try {
      if (
        !requireAuthenticatedUser(
          req,
          res
        )
      ) {
        await session.endSession();
        return;
      }

      const { id } =
        req.params;

      if (
        !isValidObjectId(id)
      ) {
        await session.endSession();

        return res.status(400).json({
          success: false,
          message:
            "Invalid project ID",
        });
      }

      const project =
        await Project.findById(id);

      if (!project) {
        await session.endSession();

        return res.status(404).json({
          success: false,
          message:
            "Project not found",
        });
      }

      if (
        !isProjectOwner(
          project,
          req.user._id
        )
      ) {
        await session.endSession();

        return res.status(403).json({
          success: false,
          message:
            "Only the project owner can delete this project",
        });
      }

      await session.withTransaction(
        async () => {
          await Task.deleteMany(
            {
              project: id,
            },
            { session }
          );

          await Notification.deleteMany(
            {
              relatedProject: id,
            },
            { session }
          );

          await Activity.deleteMany(
            {
              project: id,
            },
            { session }
          );

          await Project.deleteOne(
            {
              _id: id,
            },
            { session }
          );
        }
      );

      await session.endSession();

      return res.status(200).json({
        success: true,
        message:
          "Project deleted successfully",
      });
    } catch (error) {
      await session.endSession();

      console.error(
        "DELETE PROJECT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to delete project",
      });
    }
  };

/*
===========================================================
UPDATE PROJECT
===========================================================
*/

export const updateProject =
  async (req, res) => {
    try {
      if (
        !requireAuthenticatedUser(
          req,
          res
        )
      ) {
        return;
      }

      const { id } =
        req.params;

      if (
        !isValidObjectId(id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid project ID",
        });
      }

      const project =
        await Project.findById(id);

      if (!project) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found",
        });
      }

      if (
        !isProjectOwner(
          project,
          req.user._id
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only the project owner can update this project",
        });
      }

      const {
        title,
        description,
        overview,
        difficulty,
        estimatedWeeks,
        githubRepo,
        liveLink,
      } = req.body || {};

      /*
        Partial update:
        only supplied fields are modified.
      */

      if (title !== undefined) {
        const normalizedTitle =
          normalizeString(title);

        if (!normalizedTitle) {
          return res.status(400).json({
            success: false,
            message:
              "Project title cannot be empty",
          });
        }

        if (
          normalizedTitle.length >
          MAX_TITLE_LENGTH
        ) {
          return res.status(400).json({
            success: false,
            message: `Project title cannot exceed ${MAX_TITLE_LENGTH} characters`,
          });
        }

        project.title =
          normalizedTitle;
      }

      if (
        description !==
        undefined
      ) {
        const normalizedDescription =
          normalizeString(
            description
          );

        if (
          !normalizedDescription
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Project description cannot be empty",
          });
        }

        if (
          normalizedDescription.length >
          MAX_DESCRIPTION_LENGTH
        ) {
          return res.status(400).json({
            success: false,
            message: `Project description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`,
          });
        }

        project.description =
          normalizedDescription;
      }

      if (
        overview !== undefined
      ) {
        const normalizedOverview =
          normalizeOptionalString(
            overview
          );

        if (
          normalizedOverview.length >
          MAX_OVERVIEW_LENGTH
        ) {
          return res.status(400).json({
            success: false,
            message: `Project overview cannot exceed ${MAX_OVERVIEW_LENGTH} characters`,
          });
        }

        project.overview =
          normalizedOverview;
      }

      if (
        difficulty !== undefined
      ) {
        if (
          difficulty !== "" &&
          !ALLOWED_DIFFICULTIES.includes(
            difficulty
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid project difficulty",
          });
        }

        project.difficulty =
          normalizeOptionalString(
            difficulty
          );
      }

      if (
        estimatedWeeks !==
        undefined
      ) {
        if (
          estimatedWeeks ===
          null ||
          estimatedWeeks === ""
        ) {
          project.estimatedWeeks =
            0;
        } else {
          const weeks =
            Number(
              estimatedWeeks
            );

          if (
            !Number.isFinite(
              weeks
            ) ||
            !Number.isInteger(
              weeks
            ) ||
            weeks < 0 ||
            weeks > MAX_WEEKS
          ) {
            return res.status(400).json({
              success: false,
              message: `Estimated weeks must be an integer between 0 and ${MAX_WEEKS}`,
            });
          }

          project.estimatedWeeks =
            weeks;
        }
      }

      if (
        githubRepo !== undefined
      ) {
        const normalizedGithubRepo =
          normalizeOptionalString(
            githubRepo
          );

        if (
          normalizedGithubRepo &&
          !isValidHttpUrl(
            normalizedGithubRepo
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid GitHub repository URL",
          });
        }

        project.githubRepo =
          normalizedGithubRepo;
      }

      if (
        liveLink !== undefined
      ) {
        const normalizedLiveLink =
          normalizeOptionalString(
            liveLink
          );

        if (
          normalizedLiveLink &&
          !isValidHttpUrl(
            normalizedLiveLink
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid live URL",
          });
        }

        project.liveLink =
          normalizedLiveLink;
      }

      await project.save();

      await createActivity({
        project:
          project._id,
        user:
          req.user._id,
        type:
          "project_updated",
        message: `${req.user.name} updated the project details`,
      });

      return res.status(200).json({
        success: true,
        project,
      });
    } catch (error) {
      console.error(
        "UPDATE PROJECT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          getSafeErrorMessage(
            error,
            "Unable to update project"
          ),
      });
    }
  };

/*
===========================================================
PROJECT DASHBOARD ANALYTICS
===========================================================
*/

export const getProjectDashboard =
  async (req, res) => {
    try {
      if (
        !requireAuthenticatedUser(
          req,
          res
        )
      ) {
        return;
      }

      const {
        projectId,
      } = req.params;

      if (
        !isValidObjectId(
          projectId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid project ID",
        });
      }

      const project =
        await Project.findById(
          projectId
        ).select(
          "title members"
        );

      if (!project) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found",
        });
      }

      if (
        !isProjectMember(
          project,
          req.user._id
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not a member of this project",
        });
      }

      const tasks =
        await Task.find({
          project: projectId,
        }).select(
          "status"
        );

      const totalTasks =
        tasks.length;

      const todoTasks =
        tasks.filter(
          (task) =>
            task.status ===
            "todo"
        ).length;

      const inProgressTasks =
        tasks.filter(
          (task) =>
            task.status ===
            "in-progress"
        ).length;

      const reviewTasks =
        tasks.filter(
          (task) =>
            task.status ===
            "review"
        ).length;

      const completedTasks =
        tasks.filter(
          (task) =>
            task.status ===
            "completed"
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

        projectTitle:
          project.title,

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
      console.error(
        "GET PROJECT DASHBOARD ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load project dashboard",
      });
    }
  };

/*
===========================================================
GET PROJECT ACTIVITY
===========================================================
*/

export const getProjectActivity =
  async (req, res) => {
    try {
      if (
        !requireAuthenticatedUser(
          req,
          res
        )
      ) {
        return;
      }

      const {
        projectId,
      } = req.params;

      if (
        !isValidObjectId(
          projectId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid project ID",
        });
      }

      const project =
        await Project.findById(
          projectId
        ).select(
          "members"
        );

      if (!project) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found",
        });
      }

      if (
        !isProjectMember(
          project,
          req.user._id
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not a member of this project",
        });
      }

      const activities =
        await Activity.find({
          project: projectId,
        })
          .populate(
            "user",
            "name profilePicture headline"
          )
          .sort({
            createdAt: -1,
          })
          .limit(100);

      return res.status(200).json({
        success: true,
        count:
          activities.length,
        activities,
      });
    } catch (error) {
      console.error(
        "GET PROJECT ACTIVITY ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load project activity",
      });
    }
  };

/*
===========================================================
GET PROJECT MEMBERS

Only project members can access private membership workflow
information such as pending invitations and join requests.

Emails remain excluded.
===========================================================
*/

export const getProjectMembers =
  async (req, res) => {
    try {
      if (
        !requireAuthenticatedUser(
          req,
          res
        )
      ) {
        return;
      }

      const {
        projectId,
      } = req.params;

      if (
        !isValidObjectId(
          projectId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid project ID",
        });
      }

      const project =
        await Project.findById(
          projectId
        )
          .populate(
            "members.user",
            "name profilePicture headline"
          )
          .populate(
            "pendingInvites.user",
            "name profilePicture headline"
          )
          .populate(
            "joinRequests",
            "name profilePicture headline"
          );

      if (!project) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found",
        });
      }

      if (
        !isProjectMember(
          project,
          req.user._id
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not a member of this project",
        });
      }

      return res.status(200).json({
        success: true,
        members:
          project.members,
        pendingInvites:
          project.pendingInvites,
        joinRequests:
          project.joinRequests,
      });
    } catch (error) {
      console.error(
        "GET PROJECT MEMBERS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load project members",
      });
    }
  };

/*
===========================================================
CHANGE MEMBER ROLE
===========================================================
*/

export const changeMemberRole =
  async (req, res) => {
    try {
      if (
        !requireAuthenticatedUser(
          req,
          res
        )
      ) {
        return;
      }

      const {
        projectId,
        userId,
      } = req.params;

      const { role } =
        req.body || {};

      if (
        !isValidObjectId(
          projectId
        ) ||
        !isValidObjectId(userId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid project or user ID",
        });
      }

      if (
        !ALLOWED_MEMBER_ROLES.includes(
          role
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid role",
        });
      }

      const project =
        await Project.findById(
          projectId
        );

      if (!project) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found",
        });
      }

      if (
        !isProjectOwner(
          project,
          req.user._id
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only the project owner can change member roles",
        });
      }

      const member =
        getProjectMember(
          project,
          userId
        );

      if (!member) {
        return res.status(404).json({
          success: false,
          message:
            "Member not found",
        });
      }

      if (
        member.role ===
        "owner"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Owner role cannot be changed",
        });
      }

      if (
        member.role === role
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Member already has this role",
        });
      }

      const previousRole =
        member.role;

      member.role = role;

      await project.save();

      await createActivity({
        project:
          project._id,
        user:
          req.user._id,
        type:
          role === "admin"
            ? "member_promoted"
            : "member_demoted",
        message: `${req.user.name} changed a member role from ${previousRole} to ${role}`,
      });

      await createNotification({
        recipient: userId,
        sender:
          req.user._id,
        type:
          "project_role_updated",
        message: `Your role has been changed to ${role}`,
        relatedProject:
          project._id,
      });

      return res.status(200).json({
        success: true,
        message:
          "Member role updated successfully",
      });
    } catch (error) {
      console.error(
        "CHANGE MEMBER ROLE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update member role",
      });
    }
  };

/*
===========================================================
REMOVE MEMBER

When a member is removed:
- membership is removed
- tasks assigned to them are unassigned
- audit activity is recorded
- notification is sent

We deliberately do NOT invent a new notification enum value.
The current Notification schema does not support
"project_member_removed".
===========================================================
*/

export const removeMember =
  async (req, res) => {
    try {
      if (
        !requireAuthenticatedUser(
          req,
          res
        )
      ) {
        return;
      }

      const {
        projectId,
        userId,
      } = req.params;

      if (
        !isValidObjectId(
          projectId
        ) ||
        !isValidObjectId(userId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid project or user ID",
        });
      }

      const project =
        await Project.findById(
          projectId
        );

      if (!project) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found",
        });
      }

      if (
        !isProjectOwner(
          project,
          req.user._id
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only the project owner can remove members",
        });
      }

      const member =
        getProjectMember(
          project,
          userId
        );

      if (!member) {
        return res.status(404).json({
          success: false,
          message:
            "Member not found",
        });
      }

      if (
        member.role ===
        "owner"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Owner cannot be removed",
        });
      }

      project.members =
        project.members.filter(
          (memberItem) =>
            memberItem.user?.toString() !==
            userId
        );

      /*
        A removed developer can no longer own active work
        inside the project. Unassign those tasks so the
        project does not contain dangling ownership.
      */
      await Task.updateMany(
        {
          project: project._id,
          assignedTo: userId,
        },
        {
          $set: {
            assignedTo: null,
          },
        }
      );

      await project.save();

      await createActivity({
        project:
          project._id,
        user:
          req.user._id,
        type:
          "member_removed",
        message: `${req.user.name} removed a member from the project`,
      });

      /*
        Current Notification schema does not have a dedicated
        member-removed type. Use the existing supported
        connection_removed event rather than violating the
        enum and causing a validation failure.
      */
      await createNotification({
        recipient: userId,
        sender:
          req.user._id,
        type:
          "connection_removed",
        message: `You have been removed from "${project.title}"`,
        relatedProject:
          project._id,
      });

      return res.status(200).json({
        success: true,
        message:
          "Member removed successfully",
      });
    } catch (error) {
      console.error(
        "REMOVE MEMBER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to remove member",
      });
    }
  };

/*
===========================================================
LEAVE PROJECT
===========================================================
*/

export const leaveProject =
  async (req, res) => {
    try {
      if (
        !requireAuthenticatedUser(
          req,
          res
        )
      ) {
        return;
      }

      const {
        projectId,
      } = req.params;

      if (
        !isValidObjectId(
          projectId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid project ID",
        });
      }

      const project =
        await Project.findById(
          projectId
        );

      if (!project) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found",
        });
      }

      const userId =
        getUserId(req);

      const member =
        getProjectMember(
          project,
          userId
        );

      if (!member) {
        return res.status(404).json({
          success: false,
          message:
            "You are not a member",
        });
      }

      if (
        member.role ===
        "owner"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Transfer ownership before leaving the project",
        });
      }

      project.members =
        project.members.filter(
          (memberItem) =>
            memberItem.user?.toString() !==
            userId
        );

      await Task.updateMany(
        {
          project:
            project._id,
          assignedTo:
            req.user._id,
        },
        {
          $set: {
            assignedTo: null,
          },
        }
      );

      await project.save();

      await createActivity({
        project:
          project._id,
        user:
          req.user._id,
        type:
          "member_removed",
        message: `${req.user.name} left the project`,
      });

      return res.status(200).json({
        success: true,
        message:
          "You left the project successfully",
      });
    } catch (error) {
      console.error(
        "LEAVE PROJECT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to leave project",
      });
    }
  };

/*
===========================================================
SEARCH DEVELOPERS

Bounded search:
- max 20 results
- no email exposure
- escaped regex input
===========================================================
*/

const escapeRegex = (
  value
) => {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

export const searchDevelopers =
  async (req, res) => {
    try {
      if (
        !requireAuthenticatedUser(
          req,
          res
        )
      ) {
        return;
      }

      const keyword =
        normalizeString(
          req.query.search
        );

      if (
        keyword.length >
        100
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Search query is too long",
        });
      }

      const escapedKeyword =
        escapeRegex(
          keyword
        );

      const users =
        await User.find({
          name: {
            $regex:
              escapedKeyword,
            $options: "i",
          },
          _id: {
            $ne:
              req.user._id,
          },
        })
          .select(
            "name profilePicture headline"
          )
          .sort({
            name: 1,
          })
          .limit(20)
          .lean();

      return res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      console.error(
        "SEARCH DEVELOPERS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to search developers",
      });
    }
  };

/*
===========================================================
CONNECT GITHUB REPOSITORY
===========================================================
*/

export const connectGitHubRepository =
  async (req, res) => {
    try {
      if (
        !requireAuthenticatedUser(
          req,
          res
        )
      ) {
        return;
      }

      const {
        projectId,
      } = req.params;

      const {
        repositoryUrl,
      } = req.body || {};

      if (
        !isValidObjectId(
          projectId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid project ID",
        });
      }

      const parsedRepository =
        parseGitHubRepositoryUrl(
          repositoryUrl
        );

      if (!parsedRepository) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid GitHub repository URL",
        });
      }

      const project =
        await Project.findById(
          projectId
        );

      if (!project) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found",
        });
      }

      if (
        !isProjectOwner(
          project,
          req.user._id
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only owner can connect repository",
        });
      }

      project.githubRepository = {
        url:
          parsedRepository.url,
        owner:
          parsedRepository.owner,
        repo:
          parsedRepository.repo,
        branch:
          project.githubRepository
            ?.branch ||
          "main",
        connectedAt:
          new Date(),
      };

      await project.save();

      await createActivity({
        project:
          project._id,
        user:
          req.user._id,
        type:
          "github_connected",
        message: `${req.user.name} connected GitHub repository`,
      });

      return res.status(200).json({
        success: true,
        githubRepository:
          project.githubRepository,
      });
    } catch (error) {
      console.error(
        "CONNECT GITHUB REPOSITORY ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to connect GitHub repository",
      });
    }
  };

/*
===========================================================
FETCH GITHUB REPOSITORY DETAILS

Repository metadata is project data, therefore only project
members may access it.
===========================================================
*/

export const getGitHubRepositoryDetails =
  async (req, res) => {
    try {
      if (
        !requireAuthenticatedUser(
          req,
          res
        )
      ) {
        return;
      }

      const {
        projectId,
      } = req.params;

      if (
        !isValidObjectId(
          projectId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid project ID",
        });
      }

      const project =
        await Project.findById(
          projectId
        ).select(
          "members githubRepository"
        );

      if (!project) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found",
        });
      }

      if (
        !isProjectMember(
          project,
          req.user._id
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not a member of this project",
        });
      }

      const repository =
        project.githubRepository;

      if (
        !repository?.owner ||
        !repository?.repo
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Repository not connected",
        });
      }

      const owner =
        repository.owner;

      const repo =
        repository.repo;

      const githubResponse =
        await axios.get(
          `https://api.github.com/repos/${encodeURIComponent(
            owner
          )}/${encodeURIComponent(
            repo
          )}`,
          {
            timeout: 10000,
            headers: {
              Accept:
                "application/vnd.github+json",
              "User-Agent":
                "DevConnect",
            },
          }
        );

      const data =
        githubResponse.data;

      return res.status(200).json({
        success: true,

        repository: {
          stars:
            data.stargazers_count,

          forks:
            data.forks_count,

          issues:
            data.open_issues_count,

          watchers:
            data.subscribers_count,

          language:
            data.language,

          defaultBranch:
            data.default_branch,

          updatedAt:
            data.updated_at,

          htmlUrl:
            data.html_url,
        },
      });
    } catch (error) {
      console.error(
        "GET GITHUB REPOSITORY DETAILS ERROR:",
        error
      );

      /*
        GitHub-specific failures should not expose the
        upstream error body to the client.
      */
      if (
        error?.response?.status ===
        404
      ) {
        return res.status(404).json({
          success: false,
          message:
            "GitHub repository not found",
        });
      }

      if (
        error?.code ===
          "ECONNABORTED" ||
        error?.code ===
          "ETIMEDOUT"
      ) {
        return res.status(504).json({
          success: false,
          message:
            "GitHub request timed out",
        });
      }

      return res.status(502).json({
        success: false,
        message:
          "Unable to fetch GitHub repository details",
      });
    }
  };