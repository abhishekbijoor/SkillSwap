const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    requester_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    skills_exchange: {
      teaching: { type: String, required: true },
      learning: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "cancelled", "declined"],
      default: "pending",
    },
    message: String,
    scheduled_at: Date,
    duration_minutes: { type: Number, default: 60 },
    format: {
      type: String,
      enum: ["Video call", "In-person", "Chat-based"],
      default: "Video call",
    },
    meeting_link: String,
    notes: String,
    feedback: {
      from_requester: {
        rating: { type: Number, min: 1, max: 5 },
        review: String,
        endorsements: [String],
        submitted_at: Date,
      },
      from_recipient: {
        rating: { type: Number, min: 1, max: 5 },
        review: String,
        endorsements: [String],
        submitted_at: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for queries
sessionSchema.index({ requester_id: 1, status: 1 });
sessionSchema.index({ recipient_id: 1, status: 1 });
sessionSchema.index({ scheduled_at: 1 });

module.exports = mongoose.model("Session", sessionSchema);
