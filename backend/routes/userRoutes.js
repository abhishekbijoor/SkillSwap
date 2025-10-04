const express = require("express");
const router = express.Router();
const checkJwt = require("../middleware/auth");
const userController = require("../controllers/userController");

// All routes require authentication
router.use(checkJwt);

// Get or create user (called after Auth0 login)
router.get("/me", userController.getCurrentUser);
router.post("/init", userController.getOrCreateUser);

// Profile management
router.put("/profile", userController.updateProfile);
router.put("/skills", userController.updateSkills);
router.post("/verification/documents", userController.uploadVerificationDocs);

// Get other user profiles
router.get("/:userId", userController.getUserProfile);

module.exports = router;
