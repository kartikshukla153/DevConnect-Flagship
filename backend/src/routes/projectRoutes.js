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
  changeMemberRole,
  removeMember,
  leaveProject,
} from "../controllers/projectController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import checkProjectRole from "../middleware/projectPermissionMiddleware.js";

const router = express.Router();

/* -------------------- PROJECTS -------------------- */

router.post("/", authMiddleware, createProject);

router.get("/", getAllProjects);
router.get(
  "/members/:projectId",
  authMiddleware,
  checkProjectRole("owner", "admin", "member"),
  getProjectMembers
);

router.get("/:id", getSingleProject);

router.delete(
  "/:id",
  authMiddleware,
  checkProjectRole("owner"),
  deleteProject
);

/* -------------------- DASHBOARD -------------------- */

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

/* -------------------- MEMBERS -------------------- */

router.get(
  "/members/:projectId",
  authMiddleware,
  checkProjectRole("owner", "admin", "member"),
  getProjectMembers
);

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

/* -------------------- JOIN REQUESTS -------------------- */

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

/* -------------------- INVITES -------------------- */

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

router.put(
  "/leave/:projectId",
  authMiddleware,
  checkProjectRole("owner", "admin", "member"),
  leaveProject
);
export default router;