import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
  meetingId: { type: String, required: true, unique: true },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  hostName: { type: String },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  pendingRequests: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: String,
    },
  ],
  isGroupMeeting: { type: Boolean, default: false },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
});

export default mongoose.model("Meeting", meetingSchema);
