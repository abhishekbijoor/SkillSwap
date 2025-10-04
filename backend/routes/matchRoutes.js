const express = require("express");
const router = express.Router();
const checkJwt = require("../middleware/auth");
const matchController = require("../controllers/matchController");

router.use(checkJwt);

// Find matches using Gemini AI
router.post("/find", matchController.findMatches);

// Get detailed match explanation
router.get("/explain/:target_user_id", matchController.getMatchExplanation);

module.exports = router;
