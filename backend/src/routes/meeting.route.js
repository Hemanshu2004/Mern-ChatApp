import express from "express";
import {
  createMeeting,
  getMeetingDetails,
  joinMeeting,
  respondToJoinRequest,
  endMeeting,
} from "../controllers/meeting.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply auth middleware
router.use(protectRoute);

// ✅ Create a new meeting
router.post("/create", createMeeting);

// ✅ Get meeting details
router.get("/:meetingId", getMeetingDetails);

// ✅ Join meeting
router.post("/:meetingId/join", joinMeeting);

// ✅ Respond to join request (approve/reject)
router.post("/:meetingId/respond", respondToJoinRequest);

// ✅ End meeting (host only)
router.delete("/:meetingId", endMeeting);

export default router;
