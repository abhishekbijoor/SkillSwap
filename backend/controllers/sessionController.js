const Session = require("../models/Session");
const User = require("../models/User");

// Create swap request
exports.createSwapRequest = async (req, res) => {
  try {
    const { sub: auth0_id } = req.auth;
    const {
      recipient_id,
      skills_exchange,
      message,
      scheduled_at,
      format,
      duration_minutes,
    } = req.body;

    // Get requester
    const requester = await User.findOne({ auth0_id });
    if (!requester) {
      return res.status(404).json({ error: "Requester not found" });
    }

    // Create session
    const session = await Session.create({
      requester_id: requester._id,
      recipient_id,
      skills_exchange,
      message,
      scheduled_at,
      format,
      duration_minutes: duration_minutes || 60,
      status: "pending",
    });

    // Populate user details
    await session.populate(["requester_id", "recipient_id"]);

    res.status(201).json({ session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's sessions
exports.getUserSessions = async (req, res) => {
  try {
    const { sub: auth0_id } = req.auth;
    const { status } = req.query;

    const user = await User.findOne({ auth0_id });
    if (!user) {
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

    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update session status (accept/decline)
exports.updateSessionStatus = async (req, res) => {
  try {
    const { sub: auth0_id } = req.auth;
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
    const { sub: auth0_id } = req.auth;
    const { sessionId } = req.params;
    const { rating, review, endorsements } = req.body;

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

    // Update feedback
    const feedbackField = isRequester
      ? "feedback.from_requester"
      : "feedback.from_recipient";
    session.set(feedbackField, {
      rating,
      review,
      endorsements,
      submitted_at: new Date(),
    });

    // If both feedbacks submitted, mark session as completed
    if (session.feedback.from_requester && session.feedback.from_recipient) {
      session.status = "completed";

      // Update user stats
      const otherUserId = isRequester
        ? session.recipient_id
        : session.requester_id;
      const otherUser = await User.findById(otherUserId);

      // Calculate new average rating
      const totalRatings = otherUser.stats.total_swaps + 1;
      const newAvgRating =
        (otherUser.stats.avg_rating * otherUser.stats.total_swaps + rating) /
        totalRatings;

      otherUser.stats.total_swaps += 1;
      otherUser.stats.avg_rating = Math.round(newAvgRating * 10) / 10;
      otherUser.stats.total_hours += session.duration_minutes / 60;

      // Update endorsements
      endorsements.forEach((skill) => {
        const currentCount = otherUser.stats.endorsements.get(skill) || 0;
        otherUser.stats.endorsements.set(skill, currentCount + 1);
      });

      await otherUser.save();
    }

    await session.save();
    await session.populate(["requester_id", "recipient_id"]);

    res.json({ session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get session details
exports.getSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { sub: auth0_id } = req.auth;

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
