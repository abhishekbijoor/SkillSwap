import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { sessionAPI } from "../services/api";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
} from "lucide-react";
import "./MySessions.css";

const MySessions = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useUser();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      console.log("Fetching user sessions...");
      const response = await sessionAPI.getUserSessions();
      console.log("Sessions fetched:", response.data.sessions.length);
      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error("Error fetching sessions:", error.response?.data || error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <AlertCircle size={20} className="status-icon pending" />;
      case "accepted":
        return <CheckCircle size={20} className="status-icon accepted" />;
      case "completed":
        return <CheckCircle size={20} className="status-icon completed" />;
      case "declined":
      case "cancelled":
        return <XCircle size={20} className="status-icon declined" />;
      default:
        return null;
    }
  };

  const handleMarkComplete = (session, e) => {
    e.stopPropagation();
    setSelectedSession(session);
    setShowRatingModal(true);
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setSubmittingRating(true);
    try {
      await sessionAPI.submitFeedback(selectedSession._id, {
        rating,
        review,
      });

      // Refresh sessions
      await fetchSessions();

      // Close modal and reset
      setShowRatingModal(false);
      setSelectedSession(null);
      setRating(0);
      setReview("");
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Failed to submit rating. Please try again.");
    } finally {
      setSubmittingRating(false);
    }
  };

  const filteredSessions = sessions.filter((session) => {
    if (filter === "all") return true;
    return session.status === filter;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="my-sessions-page">
      <div className="container">
        <button onClick={() => navigate("/dashboard")} className="back-btn">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <div className="sessions-header">
          <h1>My Sessions</h1>
          <div className="session-filters">
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All ({sessions.length})
            </button>
            <button
              className={`filter-btn ${filter === "pending" ? "active" : ""}`}
              onClick={() => setFilter("pending")}
            >
              Pending ({sessions.filter((s) => s.status === "pending").length})
            </button>
            <button
              className={`filter-btn ${filter === "accepted" ? "active" : ""}`}
              onClick={() => setFilter("accepted")}
            >
              Upcoming ({sessions.filter((s) => s.status === "accepted").length}
              )
            </button>
            <button
              className={`filter-btn ${filter === "completed" ? "active" : ""}`}
              onClick={() => setFilter("completed")}
            >
              Completed (
              {sessions.filter((s) => s.status === "completed").length})
            </button>
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="no-sessions">
            <Calendar size={64} />
            <h2>No sessions found</h2>
            <p>Start by finding a match and requesting a skill swap!</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="btn btn-primary"
            >
              Find Matches
            </button>
          </div>
        ) : (
          <div className="sessions-list">
            {filteredSessions.map((session) => {
              // Determine who is who in this session
              const isRequester = currentUser?._id === session.requester_id._id;
              const requesterName = session.requester_id.profile.name;
              const recipientName = session.recipient_id.profile.name;

              // What each person is teaching
              const requesterTeaching = session.skills_exchange.teaching;
              const recipientTeaching = session.skills_exchange.learning;

              return (
                <div
                  key={session._id}
                  className="session-card"
                  onClick={() => navigate(`/session/${session._id}`)}
                >
                  <div className="session-status">
                    {getStatusIcon(session.status)}
                    <span className={`status-text ${session.status}`}>
                      {session.status.charAt(0).toUpperCase() +
                        session.status.slice(1)}
                    </span>
                  </div>

                  <div className="session-content">
                    <div className="session-users">
                      <div className="user-info">
                        <User size={16} />
                        <span>{requesterName}</span>
                      </div>
                      <span className="swap-arrow">↔</span>
                      <div className="user-info">
                        <User size={16} />
                        <span>{recipientName}</span>
                      </div>
                    </div>

                    <div className="session-skills">
                      <div className="skill-exchange">
                        <span className="skill-label">{requesterName} teaches:</span>
                        <span className="skill-name">
                          {requesterTeaching}
                        </span>
                      </div>
                      <span className="exchange-icon">↔</span>
                      <div className="skill-exchange">
                        <span className="skill-label">{recipientName} teaches:</span>
                        <span className="skill-name">
                          {recipientTeaching}
                        </span>
                      </div>
                    </div>

                  {session.scheduled_at && (
                    <div className="session-datetime">
                      <Calendar size={16} />
                      <span>
                        {new Date(session.scheduled_at).toLocaleDateString()}
                      </span>
                      <Clock size={16} />
                      <span>
                        {new Date(session.scheduled_at).toLocaleTimeString()}
                      </span>
                    </div>
                  )}

                  <div className="session-format">
                    <span className="badge">{session.format}</span>
                    <span className="duration">
                      {session.duration_minutes} minutes
                    </span>
                  </div>

                  {/* Mark Complete / Leave Rating Button */}
                  {(session.status === "pending" || session.status === "accepted" || session.status === "completed") && (() => {
                    // Check if current user has already submitted feedback
                    const isRequester = currentUser?._id === session.requester_id._id;
                    const feedbackField = isRequester ? "from_requester" : "from_recipient";
                    const otherFeedbackField = isRequester ? "from_recipient" : "from_requester";
                    const hasSubmittedFeedback = session.feedback?.[feedbackField]?.rating;
                    const otherHasSubmittedFeedback = session.feedback?.[otherFeedbackField]?.rating;

                    if (hasSubmittedFeedback) {
                      if (otherHasSubmittedFeedback) {
                        return (
                          <div className="feedback-submitted">
                            ✓ Both ratings submitted - Session complete!
                          </div>
                        );
                      }
                      return (
                        <div className="feedback-submitted">
                          ✓ Rating submitted - Waiting for other person
                        </div>
                      );
                    }

                    // If session is already completed (other user marked it complete), show "Leave Rating"
                    if (session.status === "completed") {
                      return (
                        <button
                          className="btn-rating"
                          onClick={(e) => handleMarkComplete(session, e)}
                        >
                          Leave Rating
                        </button>
                      );
                    }

                    // Otherwise show "Mark as Completed"
                    return (
                      <button
                        className="btn-complete"
                        onClick={(e) => handleMarkComplete(session, e)}
                      >
                        Mark as Completed
                      </button>
                    );
                  })()}
                </div>

                <div className="session-arrow">→</div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {showRatingModal && selectedSession && (
        <div className="modal-overlay" onClick={() => setShowRatingModal(false)}>
          <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
            <h2>
              {selectedSession.status === "completed"
                ? "Rate Your Session"
                : "Complete Session & Rate"}
            </h2>
            <p>
              Session with{" "}
              {currentUser?._id === selectedSession.requester_id._id
                ? selectedSession.recipient_id.profile.name
                : selectedSession.requester_id.profile.name}
            </p>

            <div className="rating-section">
              <label>Rating</label>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={32}
                    className={`star ${rating >= star ? "filled" : ""}`}
                    onClick={() => setRating(star)}
                    fill={rating >= star ? "#ffc107" : "none"}
                    stroke={rating >= star ? "#ffc107" : "#ccc"}
                  />
                ))}
              </div>
            </div>

            <div className="review-section">
              <label>Review (Optional)</label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience..."
                rows={4}
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowRatingModal(false);
                  setRating(0);
                  setReview("");
                }}
                disabled={submittingRating}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmitRating}
                disabled={submittingRating}
              >
                {submittingRating ? "Submitting..." : "Submit Rating"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySessions;
