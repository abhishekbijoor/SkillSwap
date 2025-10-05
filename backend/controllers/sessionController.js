const Session = require("../models/Session");
const User = require("../models/User");

// Create swap request
exports.createSwapRequest = async (req, res) => {
  try {
    const auth0_id = req.auth?.payload?.sub || "dev-user-123";
    const {
      recipient_id,
      skills_exchange,
      message,
      scheduled_at,
      format,
      duration_minutes,
    } = req.body;

    console.log("Creating swap request:", {
      auth0_id,
      recipient_id,
      skills_exchange,
      format,
    });

    // Get requester
    const requester = await User.findOne({ auth0_id });
    if (!requester) {
      console.error("Requester not found for auth0_id:", auth0_id);
      return res.status(404).json({ error: "Requester not found" });
    }

    // Validate recipient exists
    const recipient = await User.findById(recipient_id);
    if (!recipient) {
      console.error("Recipient not found for id:", recipient_id);
      return res.status(404).json({ error: "Recipient not found" });
    }

    // Create session
    const session = await Session.create({
      requester_id: requester._id,
      recipient_id,
      skills_exchange,
      message,
      scheduled_at: scheduled_at || null,
      format: format || "Video call",
      duration_minutes: duration_minutes || 60,
      status: "pending",
    });

    console.log("Session created successfully:", session._id);

    // Populate user details
    await session.populate(["requester_id", "recipient_id"]);

    res.status(201).json({ session });
  } catch (error) {
    console.error("Error creating swap request:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get user's sessions
exports.getUserSessions = async (req, res) => {
  try {
    const auth0_id = req.auth?.payload?.sub || "dev-user-123";
    const { status } = req.query;

    console.log("Fetching sessions for auth0_id:", auth0_id, "status filter:", status);

    const user = await User.findOne({ auth0_id });
    if (!user) {
      console.error("User not found for auth0_id:", auth0_id);
      return res.status(404).json({ error: "User not found" });
    }

    const query = {
      $or: [{ requester_id: user._id }, { recipient_id: user._id }],
    };

    if (status) {
      query.status = status;
    }

    const sessions = await Session.find(query)
      .populate("requester_id recipient_id")
      .sort({ createdAt: -1 });

    console.log(`Found ${sessions.length} sessions for user ${user._id}`);

    res.json({ sessions });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update session status (accept/decline)
exports.updateSessionStatus = async (req, res) => {
  try {
    const auth0_id = req.auth?.payload?.sub || "dev-user-123";
    const { sessionId } = req.params;
    const { status, meeting_link } = req.body;

    const user = await User.findOne({ auth0_id });
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Verify user is the recipient
    if (session.recipient_id.toString() !== user._id.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    session.status = status;
    if (meeting_link) {
      session.meeting_link = meeting_link;
    }
    await session.save();

    await session.populate(["requester_id", "recipient_id"]);

    res.json({ session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit feedback
exports.submitFeedback = async (req, res) => {
  try {
    const auth0_id = req.auth?.payload?.sub || "dev-user-123";
    const { sessionId } = req.params;
    const { rating, review, endorsements = [] } = req.body;

    console.log("Submitting feedback for session:", sessionId, "rating:", rating);

    const user = await User.findOne({ auth0_id });
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Determine if user is requester or recipient
    const isRequester = session.requester_id.toString() === user._id.toString();
    const isRecipient = session.recipient_id.toString() === user._id.toString();

    if (!isRequester && !isRecipient) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Determine who is being rated (the other person in the session)
    const otherUserId = isRequester ? session.recipient_id : session.requester_id;
    const otherUser = await User.findById(otherUserId);

    // Initialize feedback object if it doesn't exist
    session.feedback = session.feedback || {};

    // Update feedback based on who is submitting
    const feedbackField = isRequester ? "from_requester" : "from_recipient";

    // Check if this user has already submitted feedback
    if (session.feedback[feedbackField] && session.feedback[feedbackField].rating) {
      return res.status(400).json({ error: "You have already submitted feedback for this session" });
    }

    session.feedback[feedbackField] = {
      rating,
      review: review || "",
      endorsements: Array.isArray(endorsements) ? endorsements : [],
      submitted_at: new Date(),
    };

    // Mark session as completed when anyone submits feedback
    // This allows the other person to still see the session and submit their feedback
    session.status = "completed";

    console.log(`${isRequester ? 'Requester' : 'Recipient'} submitting feedback and updating stats`);

    // Check if this is the first feedback submission for the session
    const otherFeedbackField = isRequester ? "from_recipient" : "from_requester";
    const isFirstFeedback = !session.feedback[otherFeedbackField]?.rating;

    // Update the OTHER user's stats (the one being rated)
    const totalSwaps = otherUser.stats.total_swaps || 0;
    const currentAvgRating = otherUser.stats.avg_rating || 0;
    const totalRatings = totalSwaps + 1;
    const newAvgRating = (currentAvgRating * totalSwaps + rating) / totalRatings;

    otherUser.stats.avg_rating = Math.round(newAvgRating * 10) / 10;

    // Update endorsements for the person being rated
    if (Array.isArray(endorsements)) {
      endorsements.forEach((skill) => {
        const currentCount = otherUser.stats.endorsements.get(skill) || 0;
        otherUser.stats.endorsements.set(skill, currentCount + 1);
      });
    }

    // Only increment swap counts when the FIRST person submits feedback
    // This prevents double-counting when the second person submits
    if (isFirstFeedback) {
      otherUser.stats.total_swaps = (otherUser.stats.total_swaps || 0) + 1;
      otherUser.stats.total_hours = (otherUser.stats.total_hours || 0) + (session.duration_minutes / 60);

      user.stats.total_swaps = (user.stats.total_swaps || 0) + 1;
      user.stats.total_hours = (user.stats.total_hours || 0) + (session.duration_minutes / 60);

      console.log("First feedback - incrementing swap counts for both users");
    } else {
      console.log("Second feedback - only updating rating, swap counts already incremented");
    }

    console.log("Updated stats for both users:");
    console.log("- Rated user:", otherUser._id, {
      total_swaps: otherUser.stats.total_swaps,
      avg_rating: otherUser.stats.avg_rating,
    });
    console.log("- Rating user:", user._id, {
      total_swaps: user.stats.total_swaps,
    });

    await otherUser.save();
    await user.save();
    await session.save();
    await session.populate(["requester_id", "recipient_id"]);

    res.json({ session });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get session details
exports.getSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const auth0_id = req.auth?.payload?.sub || "dev-user-123";

    const user = await User.findOne({ auth0_id });
    const session = await Session.findById(sessionId).populate(
      "requester_id recipient_id"
    );

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Verify user is part of session
    const isParticipant =
      session.requester_id._id.toString() === user._id.toString() ||
      session.recipient_id._id.toString() === user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ error: "Not authorized" });
    }

    res.json({ session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
