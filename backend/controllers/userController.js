const User = require("../models/User");

// Get or create user after Auth0 login
exports.getOrCreateUser = async (req, res) => {
  try {
    const { sub: auth0_id, email, name } = req.auth;

    let user = await User.findOne({ auth0_id });

    if (!user) {
      // Create new user
      user = await User.create({
        auth0_id,
        profile: { email, name },
        verification: { badges: ["email"] }, // Email verified by Auth0
      });
    }

    res.json({ user, isNewUser: !user.onboarding_completed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { sub: auth0_id } = req.auth;
    const updates = req.body;

    const user = await User.findOneAndUpdate(
      { auth0_id },
      {
        $set: {
          profile: updates.profile,
          onboarding_completed: true,
        },
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add skills
exports.updateSkills = async (req, res) => {
  try {
    const { sub: auth0_id } = req.auth;
    const { skills_teaching, skills_learning } = req.body;

    const user = await User.findOneAndUpdate(
      { auth0_id },
      {
        $set: {
          skills_teaching,
          skills_learning,
          onboarding_completed: true,
        },
      },
      { new: true }
    );

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user profile by ID
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-auth0_id");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const { sub: auth0_id } = req.auth;
    const user = await User.findOne({ auth0_id });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upload verification documents
exports.uploadVerificationDocs = async (req, res) => {
  try {
    const { sub: auth0_id } = req.auth;
    const { documents } = req.body; // Array of {url, type}

    const user = await User.findOneAndUpdate(
      { auth0_id },
      {
        $push: {
          "verification.documents": {
            $each: documents.map((doc) => ({
              ...doc,
              status: "pending",
            })),
          },
        },
        $set: { "verification.status": "pending" },
      },
      { new: true }
    );

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
