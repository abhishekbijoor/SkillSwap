const express = require("express");
const router = express.Router();
const checkJwt = require("../middleware/auth");
const sessionController = require("../controllers/sessionController");

router.use(checkJwt);

// Session management
router.post("/", sessionController.createSwapRequest);
router.get("/", sessionController.getUserSessions);
router.get("/:sessionId", sessionController.getSessionDetails);
router.put("/:sessionId/status", sessionController.updateSessionStatus);
router.post("/:sessionId/feedback", sessionController.submitFeedback);

module.exports = router;
