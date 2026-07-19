import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import permission from "../middleware/permissionMiddleware.js";

import {
  sendInvitation,
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
  removeMember,
  updateRole,
} from "../controllers/invitation.controller.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  permission("owner", "admin"),
  sendInvitation
);

router.get(
  "/my",
  authMiddleware,
  getMyInvitations
);

router.put(
  "/accept/:id",
  authMiddleware,
  acceptInvitation
);

router.put(
  "/reject/:id",
  authMiddleware,
  rejectInvitation
);

router.put(
  "/role",
  authMiddleware,
  permission("owner"),
  updateRole
);

router.delete(
  "/member",
  authMiddleware,
  permission("owner"),
  removeMember
);

export default router;