import express from "express";

import {
  createProject,
  getAllProjects,
  getSingleProject,
  deleteProject,
  requestToJoinProject,
  approveJoinRequest,
  rejectJoinRequest,
  inviteDeveloperToProject,
  acceptProjectInvite,
  rejectProjectInvite,
  getProjectDashboard,
  getProjectActivity,
  getProjectMembers,
  updateProject,
  changeMemberRole,
  removeMember,
  leaveProject,
  connectGitHubRepository,
  getGitHubRepositoryDetails,
  searchDevelopers,
} from "../controllers/projectController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import checkProjectRole from "../middleware/projectPermissionMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public Project Routes
|--------------------------------------------------------------------------
*/

router.post("/", authMiddleware, createProject);

router.get("/", getAllProjects);

/*
|--------------------------------------------------------------------------
| Developer Search
|--------------------------------------------------------------------------
*/

router.get(
  "/developers/search",
  authMiddleware,
  searchDevelopers
);

/*
|--------------------------------------------------------------------------
| Project Workspace Routes
|--------------------------------------------------------------------------
|
| IMPORTANT:
| These routes MUST appear before /:id.
| Otherwise Express can interpret "dashboard", "activity", or "members"
| as a project ID.
|
|--------------------------------------------------------------------------
*/

router.get(
  "/dashboard/:projectId",
  authMiddleware,
  checkProjectRole("owner", "admin", "member"),
  getProjectDashboard
);

router.get(
  "/activity/:projectId",
  authMiddleware,
  checkProjectRole("owner", "admin", "member"),
  getProjectActivity
);

router.get(
  "/members/:projectId",
  authMiddleware,
  checkProjectRole("owner", "admin", "member"),
  getProjectMembers
);

/*
|--------------------------------------------------------------------------
| Project Member Management
|--------------------------------------------------------------------------
*/

router.put(
  "/member-role/:projectId/:userId",
  authMiddleware,
  checkProjectRole("owner"),
  changeMemberRole
);

router.delete(
  "/member/:projectId/:userId",
  authMiddleware,
  checkProjectRole("owner"),
  removeMember
);

router.put(
  "/leave/:projectId",
  authMiddleware,
  checkProjectRole("owner", "admin", "member"),
  leaveProject
);

/*
|--------------------------------------------------------------------------
| Project Join / Invitation Routes
|--------------------------------------------------------------------------
*/

router.put(
  "/join-request/:id",
  authMiddleware,
  requestToJoinProject
);

router.put(
  "/approve-request/:projectId/:userId",
  authMiddleware,
  checkProjectRole("owner", "admin"),
  approveJoinRequest
);

router.put(
  "/reject-request/:projectId/:userId",
  authMiddleware,
  checkProjectRole("owner", "admin"),
  rejectJoinRequest
);

router.put(
  "/invite/:projectId/:userId",
  authMiddleware,
  checkProjectRole("owner", "admin"),
  inviteDeveloperToProject
);

router.put(
  "/accept-invite/:projectId",
  authMiddleware,
  acceptProjectInvite
);

router.put(
  "/reject-invite/:projectId",
  authMiddleware,
  rejectProjectInvite
);

/*
|--------------------------------------------------------------------------
| GitHub Integration
|--------------------------------------------------------------------------
*/

router.post(
  "/:projectId/github/connect",
  authMiddleware,
  connectGitHubRepository
);

router.get(
  "/:projectId/github",
  authMiddleware,
  getGitHubRepositoryDetails
);

/*
|--------------------------------------------------------------------------
| Project Update / Delete
|--------------------------------------------------------------------------
*/

router.put(
  "/:id",
  authMiddleware,
  checkProjectRole("owner"),
  updateProject
);

router.delete(
  "/:id",
  authMiddleware,
  checkProjectRole("owner"),
  deleteProject
);

/*
|--------------------------------------------------------------------------
| Single Project
|--------------------------------------------------------------------------
|
| Keep this AFTER all named routes above.
|
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  getSingleProject
);

export default router;