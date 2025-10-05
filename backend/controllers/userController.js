const User = require("../models/User");

const initUser = async (req, res) => {
  try {
    // For development, use a mock user ID
    const auth0_id = req.auth?.payload?.sub || "dev-user-123";
    let user = await User.findOne({ auth0_id });

    let isNewUser = false;
    if (!user) {
      user = await User.create({
        auth0_id,
        profile: {
          name: req.auth?.payload?.name || "New User",
          email: req.auth?.payload?.email || "user@example.com",
        },
      });
      isNewUser = true;
    }

    res.json({ user, isNewUser });
  } catch (err) {
    console.error("Error initializing user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const auth0_id = req.auth?.payload?.sub || "dev-user-123";
    const user = await User.findOne({ auth0_id });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const auth0_id = req.auth?.payload?.sub || "dev-user-123";
    const user = await User.findOne({ auth0_id });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.profile = { ...user.profile, ...req.body.profile };
    await user.save();
    res.json({ user });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateSkills = async (req, res) => {
  try {
    const auth0_id = req.auth?.payload?.sub || "dev-user-123";
    const user = await User.findOne({ auth0_id });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Update skills_teaching and skills_learning
    if (req.body.skills_teaching) {
      user.skills_teaching = req.body.skills_teaching;
    }
    if (req.body.skills_learning) {
      user.skills_learning = req.body.skills_learning;
    }

    // Mark onboarding as completed when skills are saved
    user.onboarding_completed = true;

    await user.save();
    res.json({ user });
  } catch (err) {
    console.error("Error updating skills:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("Error fetching user by ID:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { initUser, getUserProfile, updateUserProfile, updateSkills, getUserById };
