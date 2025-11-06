import Group from "../models/Group.js";
import User from "../models/User.js";

// Create a new group
export async function createGroup(req, res) {
  try {
    const { name, description, language, members } = req.body;
    const adminId = req.user.id;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Group name is required" });
    }

    // Verify all members exist
    if (members && members.length > 0) {
      const validMembers = await User.find({ _id: { $in: members } });
      if (validMembers.length !== members.length) {
        return res.status(400).json({ message: "Some members do not exist" });
      }
    }

    // Create group with admin as first member (ensure no duplicates)
    const memberIds = members || [];
    const uniqueMembers = [...new Set([adminId, ...memberIds])]; // Remove duplicates
    
    const group = await Group.create({
      name: name.trim(),
      description: description?.trim() || "",
      language: language || "",
      admin: adminId,
      members: uniqueMembers,
    });

    // Populate group data
    const populatedGroup = await Group.findById(group._id)
      .populate("admin", "fullName profilePic email")
      .populate("members", "fullName profilePic nativeLanguage learningLanguage");

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error("Error in createGroup controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get all groups for current user
export async function getUserGroups(req, res) {
  try {
    const userId = req.user.id;

    let groups = await Group.find({ members: userId });

    // Clean up duplicate members in all groups
    for (let group of groups) {
      const uniqueMemberIds = [...new Set(group.members.map(m => m.toString()))];
      if (uniqueMemberIds.length !== group.members.length) {
        console.log(`Cleaning up duplicates in group ${group._id}`);
        group.members = uniqueMemberIds;
        await group.save();
      }
    }

    // Fetch again with population after cleanup
    groups = await Group.find({ members: userId })
      .populate("admin", "fullName profilePic")
      .populate("members", "fullName profilePic")
      .sort({ updatedAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getUserGroups controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Update group details
export async function updateGroup(req, res) {
  try {
    const { id: groupId } = req.params;
    const { name, description, language } = req.body;
    const userId = req.user.id;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is admin
    if (group.admin.toString() !== userId) {
      return res.status(403).json({ message: "Only admin can update group" });
    }

    // Update fields
    if (name) group.name = name.trim();
    if (description !== undefined) group.description = description.trim();
    if (language !== undefined) group.language = language;

    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("admin", "fullName profilePic")
      .populate("members", "fullName profilePic");

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error in updateGroup controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Delete group
export async function deleteGroup(req, res) {
  try {
    const { id: groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is admin
    if (group.admin.toString() !== userId) {
      return res.status(403).json({ message: "Only admin can delete group" });
    }

    await Group.findByIdAndDelete(groupId);

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error in deleteGroup controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get group details by ID
export async function getGroupDetails(req, res) {
  try {
    const { id: groupId } = req.params;
    const userId = req.user.id;

    let group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Clean up duplicate members (if any exist from old data)
    const uniqueMemberIds = [...new Set(group.members.map(m => m.toString()))];
    if (uniqueMemberIds.length !== group.members.length) {
      console.log(`Cleaning up duplicates in group ${groupId}`);
      group.members = uniqueMemberIds;
      await group.save();
    }

    // Populate after cleaning
    group = await Group.findById(groupId)
      .populate("admin", "fullName profilePic email")
      .populate("members", "fullName profilePic nativeLanguage learningLanguage");

    // Check if user is a member
    const isMember = group.members.some(
      (member) => member._id.toString() === userId
    );

    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    res.status(200).json(group);
  } catch (error) {
    console.error("Error in getGroupDetails controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Add member to group
export async function addMemberToGroup(req, res) {
  try {
    const { id: groupId } = req.params;
    const { userId: newMemberId } = req.body;
    const currentUserId = req.user.id;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if current user is admin
    if (group.admin.toString() !== currentUserId) {
      return res.status(403).json({ message: "Only admin can add members" });
    }

    // Check if user exists
    const newMember = await User.findById(newMemberId);
    if (!newMember) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already a member
    if (group.members.includes(newMemberId)) {
      return res.status(400).json({ message: "User is already a member" });
    }

    // Add member
    group.members.push(newMemberId);
    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("admin", "fullName profilePic")
      .populate("members", "fullName profilePic nativeLanguage learningLanguage");

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error in addMemberToGroup controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Remove member from group
export async function removeMemberFromGroup(req, res) {
  try {
    const { id: groupId, userId: memberToRemove } = req.params;
    const currentUserId = req.user.id;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if current user is admin or removing themselves
    const isAdmin = group.admin.toString() === currentUserId;
    const isSelf = memberToRemove === currentUserId;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ 
        message: "Only admin can remove members or you can remove yourself" 
      });
    }

    // Cannot remove admin
    if (memberToRemove === group.admin.toString()) {
      return res.status(400).json({ message: "Cannot remove group admin" });
    }

    // Check if member exists in group
    if (!group.members.includes(memberToRemove)) {
      return res.status(400).json({ message: "User is not a member" });
    }

    // Remove member
    group.members = group.members.filter(
      (memberId) => memberId.toString() !== memberToRemove
    );
    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("admin", "fullName profilePic")
      .populate("members", "fullName profilePic nativeLanguage learningLanguage");

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error in removeMemberFromGroup controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Create group meeting
export async function createGroupMeeting(req, res) {
  try {
    const { id: groupId } = req.params;
    const { hostId, hostName } = req.body;
    const currentUserId = req.user.id;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Only admin can create group meetings
    if (group.admin.toString() !== currentUserId) {
      return res.status(403).json({ message: "Only group admin can create meetings" });
    }

    // Generate meeting ID
    const meetingId = `group-${groupId}-${Date.now()}`;

    // Create Meeting document for managing join requests
    const Meeting = (await import("../models/Meeting.js")).default;
    await Meeting.create({
      meetingId,
      hostId,
      hostName,
      participants: [hostId], // Only host initially
      pendingRequests: [],
      isGroupMeeting: true,
      groupId,
    });

    // Update group with active meeting
    group.activeMeetingId = meetingId;
    await group.save();

    res.status(201).json({
      meetingId,
      groupId,
      hostId,
      hostName,
    });
  } catch (error) {
    console.error("Error in createGroupMeeting controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get group meeting
export async function getGroupMeeting(req, res) {
  try {
    const { id: groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is a member
    const isMember = group.members.some(
      (memberId) => memberId.toString() === userId
    );

    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    if (!group.activeMeetingId) {
      return res.status(404).json({ message: "No active meeting in this group" });
    }

    res.status(200).json({
      meetingId: group.activeMeetingId,
      groupId,
    });
  } catch (error) {
    console.error("Error in getGroupMeeting controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
