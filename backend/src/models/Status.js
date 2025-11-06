import mongoose from "mongoose";

const statusSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    mediaUrl: {
      type: String, // Image or video URL
    },
    mediaType: {
      type: String,
      enum: ["image", "video", "text"],
      default: "text",
    },
    backgroundColor: {
      type: String,
      default: "#1e40af", // For text-only statuses
    },
    views: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  },
  {
    timestamps: true,
  }
);

// Auto-delete expired statuses
statusSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Status", statusSchema);
