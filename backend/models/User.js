const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  proficiency: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
    required: true,
  },
  years_experience: String,
  willing_to_teach: { type: Boolean, default: false },
  certifications: [
    {
      name: String,
      issuing_org: String,
      issue_date: Date,
      credential_url: String,
      file_url: String,
    },
  ],
});

const skillLearningSchema = new mongoose.Schema({
  name: { type: String, required: true },
  current_level: {
    type: String,
    enum: ["Never tried", "Beginner", "Some experience"],
    default: "Never tried",
  },
  goal: {
    type: String,
    enum: ["Hobby", "Career Growth", "Personal Project", "Teaching Others"],
  },
  urgency: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },
});

const userSchema = new mongoose.Schema(
  {
    auth0_id: {
      type: String,
      required: true,
      unique: true,
    },
    profile: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      dob: Date,
      phone: String,
      location: {
        city: String,
        country: String,
      },
      bio: { type: String, maxlength: 500 },
      avatar_url: String,
      education: [
        {
          institution: String,
          degree: String,
          field: String,
          years: String,
        },
      ],
    },
    skills_teaching: [skillSchema],
    skills_learning: [skillLearningSchema],
    verification: {
      status: {
        type: String,
        enum: ["verified", "pending", "unverified"],
        default: "unverified",
      },
      badges: [
        {
          type: String,
          enum: ["email", "identity", "skill", "linkedin"],
        },
      ],
      documents: [
        {
          url: String,
          type: String,
          status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
          },
          reviewed_at: Date,
        },
      ],
    },
    stats: {
      total_swaps: { type: Number, default: 0 },
      avg_rating: { type: Number, default: 0 },
      total_hours: { type: Number, default: 0 },
      endorsements: { type: Map, of: Number, default: {} },
    },
    preferences: {
      availability: [String],
      preferred_format: [String],
    },
    onboarding_completed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Index for search optimization
userSchema.index({ "profile.name": "text", "profile.email": "text" });
userSchema.index({ "skills_teaching.name": 1 });
userSchema.index({ "skills_learning.name": 1 });

module.exports = mongoose.model("User", userSchema);
