const express = require("express");
const router = express.Router();
const checkJwt = require("../middleware/auth");
const {
  initUser,
  getUserProfile,
  updateUserProfile,
  updateSkills,
  getUserById,
} = require("../controllers/userController");

router.post("/init", checkJwt, initUser);
router.get("/me", checkJwt, getUserProfile);
router.put("/profile", checkJwt, updateUserProfile);
router.put("/skills", checkJwt, updateSkills);
router.get("/:userId", checkJwt, getUserById);

module.exports = router;
