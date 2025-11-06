import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createGroup,
  getUserGroups,
  getGroupDetails,
  updateGroup,
  deleteGroup,
  addMemberToGroup,
  removeMemberFromGroup,
  createGroupMeeting,
  getGroupMeeting,
} from "../controllers/group.controller.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protectRoute);

// Group CRUD operations
router.post("/create", createGroup);
router.get("/", getUserGroups);
router.get("/:id", getGroupDetails);
router.put("/:id", updateGroup);
router.delete("/:id", deleteGroup);

// Member management
router.post("/:id/members", addMemberToGroup);
router.delete("/:id/members/:userId", removeMemberFromGroup);

// Group meetings
router.post("/:id/meeting", createGroupMeeting);
router.get("/:id/meeting", getGroupMeeting);

export default router;
