import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createStatus,
  getFriendsStatuses,
  getMyStatuses,
  viewStatus,
  deleteStatus,
} from "../controllers/status.controller.js";

const router = express.Router();

// Apply auth middleware
router.use(protectRoute);

// Create status
router.post("/", createStatus);

// Get friends' statuses
router.get("/friends", getFriendsStatuses);

// Get my statuses
router.get("/my", getMyStatuses);

// View status
router.post("/:statusId/view", viewStatus);

// Delete status
router.delete("/:statusId", deleteStatus);

export default router;
