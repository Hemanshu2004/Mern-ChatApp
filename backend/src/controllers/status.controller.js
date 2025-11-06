import Status from "../models/Status.js";
import User from "../models/User.js";

// Create a new status
export async function createStatus(req, res) {
  try {
    const { content, mediaUrl, mediaType, backgroundColor } = req.body;
    const userId = req.user.id;

    const status = await Status.create({
      user: userId,
      content,
      mediaUrl,
      mediaType: mediaType || "text",
      backgroundColor: backgroundColor || "#1e40af",
    });

    const populatedStatus = await Status.findById(status._id).populate(
      "user",
      "fullName profilePic"
    );

    res.status(201).json(populatedStatus);
  } catch (error) {
    console.error("Error creating status:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get all active statuses from friends
export async function getFriendsStatuses(req, res) {
  try {
    const userId = req.user.id;

    // Get user's friends
    const user = await User.findById(userId).populate("friends");
    const friendIds = user.friends.map((friend) => friend._id);

    // Get active statuses from friends (including own status)
    const statuses = await Status.find({
      user: { $in: [...friendIds, userId] },
      expiresAt: { $gt: new Date() },
    })
      .populate("user", "fullName profilePic")
      .populate("views.user", "fullName profilePic")
      .sort({ createdAt: -1 });

    // Group statuses by user
    const groupedStatuses = statuses.reduce((acc, status) => {
      const userId = status.user._id.toString();
      if (!acc[userId]) {
        acc[userId] = {
          user: status.user,
          statuses: [],
        };
      }
      acc[userId].statuses.push(status);
      return acc;
    }, {});

    res.json(Object.values(groupedStatuses));
  } catch (error) {
    console.error("Error fetching statuses:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get user's own statuses
export async function getMyStatuses(req, res) {
  try {
    const userId = req.user.id;

    const statuses = await Status.find({
      user: userId,
      expiresAt: { $gt: new Date() },
    })
      .populate("views.user", "fullName profilePic")
      .sort({ createdAt: -1 });

    res.json(statuses);
  } catch (error) {
    console.error("Error fetching own statuses:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// View a status (add to views)
export async function viewStatus(req, res) {
  try {
    const { statusId } = req.params;
    const userId = req.user.id;

    const status = await Status.findById(statusId);

    if (!status) {
      return res.status(404).json({ message: "Status not found" });
    }

    // Check if user already viewed
    const alreadyViewed = status.views.some(
      (view) => view.user.toString() === userId
    );

    if (!alreadyViewed) {
      status.views.push({ user: userId });
      await status.save();
    }

    const updatedStatus = await Status.findById(statusId)
      .populate("user", "fullName profilePic")
      .populate("views.user", "fullName profilePic");

    res.json(updatedStatus);
  } catch (error) {
    console.error("Error viewing status:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Delete a status
export async function deleteStatus(req, res) {
  try {
    const { statusId } = req.params;
    const userId = req.user.id;

    const status = await Status.findById(statusId);

    if (!status) {
      return res.status(404).json({ message: "Status not found" });
    }

    // Only owner can delete
    if (status.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Status.findByIdAndDelete(statusId);

    res.json({ message: "Status deleted successfully" });
  } catch (error) {
    console.error("Error deleting status:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
