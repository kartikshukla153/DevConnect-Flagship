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
} from "../controllers/projectController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import checkProjectRole from "../middleware/projectPermissionMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createProject);

router.get("/", getAllProjects);

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

router.get("/:id", getSingleProject);

router.put(
  "/join-request/:id",
  authMiddleware,
  requestToJoinProject
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

router.delete(
  "/:id",
  authMiddleware,
  checkProjectRole("owner"),
  deleteProject
);

export default router;