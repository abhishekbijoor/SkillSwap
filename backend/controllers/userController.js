const User = require("../models/User");

const initUser = async (req, res) => {
  try {
    const auth0_id = req.auth.payload.sub;
    let user = await User.findOne({ auth0_id });

    let isNewUser = false;
    if (!user) {
      user = await User.create({
        auth0_id,
        profile: {
          name: req.auth.payload.name || "New User",
          email: req.auth.payload.email,
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
    const auth0_id = req.auth.payload.sub;
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
    const auth0_id = req.auth.payload.sub;
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

module.exports = { initUser, getUserProfile, updateUserProfile };
