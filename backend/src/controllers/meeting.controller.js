import { v4 as uuidv4 } from "uuid";
import Meeting from "../models/Meeting.js";
import Group from "../models/Group.js";

/**
 * ✅ Create a new meeting
 */
export const createMeeting = async (req, res) => {
  try {
    const { hostId, hostName } = req.body;

    if (!hostId) {
      return res.status(400).json({ message: "Missing host ID" });
    }

    const meetingId = uuidv4();

    const meeting = await Meeting.create({
      meetingId,
      hostId,
      hostName,
      participants: [hostId], // ✅ host auto-added
      pendingRequests: [],
    });

    console.log("✅ Meeting created:", meetingId);
    res.json({ meetingId });
  } catch (error) {
    console.error("❌ Error creating meeting:", error);
    res.status(500).json({ message: "Failed to create meeting" });
  }
};

/**
 * ✅ Get meeting details
 */
export const getMeetingDetails = async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    // Check Meeting collection first (works for both regular and group meetings)
    const meeting = await Meeting.findOne({ meetingId });

    if (meeting) {
      // If it's a group meeting, populate group name
      if (meeting.isGroupMeeting && meeting.groupId) {
        const group = await Group.findById(meeting.groupId);
        return res.json({
          ...meeting.toObject(),
          groupName: group?.name,
        });
      }
      return res.json(meeting);
    }

    return res.status(404).json({ message: "Meeting not found" });
  } catch (error) {
    console.error("❌ Error fetching meeting details:", error);
    res.status(500).json({ message: "Failed to get meeting details" });
  }
};

/**
 * ✅ Join meeting
 */
export const joinMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { userId, name } = req.body;

    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // For group meetings, verify user is a group member
    if (meeting.isGroupMeeting && meeting.groupId) {
      const group = await Group.findById(meeting.groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      const isMember = group.members.some(m => m._id.toString() === userId);
      if (!isMember) {
        return res.status(403).json({ message: "You are not a member of this group" });
      }
    }

    // ✅ If host is joining again, auto-approve
    if (meeting.hostId.toString() === userId) {
      if (!meeting.participants.includes(userId)) {
        meeting.participants.push(userId);
        await meeting.save();
      }
      return res.json({ status: "approved", meeting });
    }

    // ✅ Already participant
    if (meeting.participants.includes(userId)) {
      return res.json({ status: "approved", meeting });
    }

    // ✅ Otherwise add to pending (same for both regular and group meetings)
    const alreadyPending = meeting.pendingRequests.some(
      (r) => r.userId.toString() === userId
    );

    if (!alreadyPending) {
      meeting.pendingRequests.push({ userId, name });
      await meeting.save();
    }

    res.json({ status: "waiting", meeting });
  } catch (error) {
    console.error("❌ Error joining meeting:", error);
    res.status(500).json({ message: "Failed to join meeting" });
  }
};

/**
 * ✅ End meeting (host only)
 */
export const endMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const userId = req.user.id;

    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Only host can end the meeting
    if (meeting.hostId.toString() !== userId) {
      return res.status(403).json({ message: "Only host can end the meeting" });
    }

    // If it's a group meeting, clear the activeMeetingId from the group
    if (meeting.isGroupMeeting && meeting.groupId) {
      await Group.findByIdAndUpdate(meeting.groupId, { activeMeetingId: null });
    }

    // Delete the meeting
    await Meeting.deleteOne({ meetingId });

    res.json({ message: "Meeting ended successfully" });
  } catch (error) {
    console.error("❌ Error ending meeting:", error);
    res.status(500).json({ message: "Failed to end meeting" });
  }
};

/**
 * ✅ Host responds to join requests
 */
export const respondToJoinRequest = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { userId, action } = req.body;

    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Remove from pending
    meeting.pendingRequests = meeting.pendingRequests.filter(
      (r) => r.userId.toString() !== userId
    );

    // Approve user
    if (action === "approve") {
      if (!meeting.participants.includes(userId)) {
        meeting.participants.push(userId);
      }
    }

    await meeting.save();
    res.json({ success: true, meeting });
  } catch (error) {
    console.error("❌ Error responding to join request:", error);
    res.status(500).json({ message: "Failed to update join request" });
  }
};
