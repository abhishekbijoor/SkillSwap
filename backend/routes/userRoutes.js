const express = require("express");
const router = express.Router();
const checkJwt = require("../middleware/auth");
const {
  initUser,
  getUserProfile,
  updateUserProfile,
  updateSkills,
  getUserById,
  getLeaderboard,
} = require("../controllers/userController");

// Specific routes must come before parameterized routes
router.post("/init", checkJwt, initUser);
router.get("/me", checkJwt, getUserProfile);
router.get("/leaderboard", checkJwt, getLeaderboard);
router.put("/profile", checkJwt, updateUserProfile);
router.put("/skills", checkJwt, updateSkills);

// Parameterized route comes last
router.get("/:userId", checkJwt, getUserById);

module.exports = router;
