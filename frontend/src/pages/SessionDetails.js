import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { sessionAPI } from "../services/api";
import { useUser } from "../context/UserContext";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  Check,
  X,
  Star,
  Send,
} from "lucide-react";
import "./SessionDetails.css";

const SessionDetails = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useUser();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState({
    rating: 5,
    review: "",
    endorsements: [],
  });

  useEffect(() => {
    fetchSessionDetails();
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    try {
      const response = await sessionAPI.getSessionDetails(sessionId);
      setSession(response.data.session);
    } catch (error) {
      console.error("Error fetching session:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      await sessionAPI.updateSessionStatus(sessionId, {
        status: "accepted",
        meeting_link: "https://meet.google.com/xxx-xxxx-xxx", // In real app, generate actual link
      });
      fetchSessionDetails();
    } catch (error) {
      console.error("Error accepting session:", error);
      alert("Failed to accept session");
    }
  };

  const handleDecline = async () => {
    try {
      await sessionAPI.updateSessionStatus(sessionId, { status: "declined" });
      fetchSessionDetails();
    } catch (error) {
      console.error("Error declining session:", error);
      alert("Failed to decline session");
    }
  };

  const handleMarkCompleted = async () => {
    if (!window.confirm("Mark this session as completed? You'll be asked to leave a rating.")) {
      return;
    }

    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      await sessionAPI.submitFeedback(sessionId, feedback);
      setShowFeedbackModal(false);
      fetchSessionDetails();
      alert("Session completed and feedback submitted successfully!");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback");
    }
  };

  const toggleEndorsement = (skill) => {
    setFeedback((prev) => ({
      ...prev,
      endorsements: prev.endorsements.includes(skill)
        ? prev.endorsements.filter((s) => s !== skill)
        : [...prev.endorsements, skill],
    }));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!session) {
    return <div className="error-page">Session not found</div>;
  }

  const isRequester = session.requester_id._id === currentUser?._id;
  const isRecipient = session.recipient_id._id === currentUser?._id;
  const otherUser = isRequester ? session.recipient_id : session.requester_id;
  const hasFeedback = isRequester
    ? session.feedback?.from_requester
    : session.feedback?.from_recipient;

  return (
    <div className="session-details-page">
      <div className="container">
        <button onClick={() => navigate("/sessions")} className="back-btn">
          <ArrowLeft size={20} /> Back to Sessions
        </button>

        <div className="session-detail-layout">
          {/* Session Info Card */}
          <div className="session-info-card">
            <div className="session-header">
              <h1>Skill Swap Session</h1>
              <span className={`status-badge ${session.status}`}>
                {session.status}
              </span>
            </div>

            <div className="skill-exchange-display">
              <div className="exchange-side">
                <div className="user-avatar-small">
                  {session.requester_id.profile.name.charAt(0)}
                </div>
                <div>
                  <p className="user-name">
                    {session.requester_id.profile.name}
                  </p>
                  <p className="teaching">
                    Teaching:{" "}
                    <strong>{session.skills_exchange.teaching}</strong>
                  </p>
                </div>
              </div>

              <div className="exchange-arrow-large">↔</div>

              <div className="exchange-side">
                <div className="user-avatar-small">
                  {session.recipient_id.profile.name.charAt(0)}
                </div>
                <div>
                  <p className="user-name">
                    {session.recipient_id.profile.name}
                  </p>
                  <p className="learning">
                    Learning:{" "}
                    <strong>{session.skills_exchange.learning}</strong>
                  </p>
                </div>
              </div>
            </div>

            {session.message && (
              <div className="session-message">
                <h3>Message from {session.requester_id.profile.name}:</h3>
                <p>{session.message}</p>
              </div>
            )}

            <div className="session-details-grid">
              {session.scheduled_at && (
                <div className="detail-item">
                  <Calendar size={20} />
                  <div>
                    <span className="detail-label">Date</span>
                    <span className="detail-value">
                      {new Date(session.scheduled_at).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                </div>
              )}

              {session.scheduled_at && (
                <div className="detail-item">
                  <Clock size={20} />
                  <div>
                    <span className="detail-label">Time</span>
                    <span className="detail-value">
                      {new Date(session.scheduled_at).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                </div>
              )}

              <div className="detail-item">
                <Video size={20} />
                <div>
                  <span className="detail-label">Format</span>
                  <span className="detail-value">{session.format}</span>
                </div>
              </div>

              <div className="detail-item">
                <Clock size={20} />
                <div>
                  <span className="detail-label">Duration</span>
                  <span className="detail-value">
                    {session.duration_minutes} minutes
                  </span>
                </div>
              </div>
            </div>

            {session.meeting_link && session.status === "accepted" && (
              <div className="meeting-link-section">
                <h3>Join Meeting</h3>
                <a
                  href={session.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-full"
                >
                  <Video size={20} />
                  Join Video Call
                </a>
              </div>
            )}

            {/* Action Buttons */}
            {session.status === "pending" && isRecipient && (
              <div className="session-actions">
                <button onClick={handleAccept} className="btn btn-primary">
                  <Check size={20} />
                  Accept Request
                </button>
                <button onClick={handleDecline} className="btn btn-secondary">
                  <X size={20} />
                  Decline
                </button>
              </div>
            )}

            {/* Mark as Completed - Available for Both Users */}
            {session.status === "accepted" && !hasFeedback && (
              <div className="completion-section">
                <p className="completion-message">
                  Have you completed this skill swap session?
                </p>
                <button
                  onClick={handleMarkCompleted}
                  className="btn btn-primary btn-full"
                >
                  <Check size={20} />
                  Mark as Completed & Rate
                </button>
              </div>
            )}
          </div>

          {/* User Info Sidebar */}
          <aside className="user-sidebar">
            <h3>Swap Partner</h3>
            <div className="partner-card">
              <div className="partner-avatar">
                {otherUser.profile.avatar_url ? (
                  <img
                    src={otherUser.profile.avatar_url}
                    alt={otherUser.profile.name}
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {otherUser.profile.name.charAt(0)}
                  </div>
                )}
              </div>
              <h4>{otherUser.profile.name}</h4>
              {otherUser.stats.avg_rating > 0 && (
                <div className="partner-rating">
                  <Star size={16} fill="#FCD34D" stroke="#FCD34D" />
                  {otherUser.stats.avg_rating.toFixed(1)} (
                  {otherUser.stats.total_swaps} swaps)
                </div>
              )}
              <button
                onClick={() => navigate(`/profile/${otherUser._id}`)}
                className="btn btn-secondary btn-full"
              >
                View Full Profile
              </button>
            </div>

            {/* Display Feedback if exists */}
            {session.status === "completed" && session.feedback && (
              <div className="feedback-display">
                <h3>Feedback</h3>

                {session.feedback.from_requester && (
                  <div className="feedback-item">
                    <p className="feedback-from">
                      From {session.requester_id.profile.name}:
                    </p>
                    <div className="rating-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={
                            i < session.feedback.from_requester.rating
                              ? "#FCD34D"
                              : "none"
                          }
                          stroke={
                            i < session.feedback.from_requester.rating
                              ? "#FCD34D"
                              : "#D1D5DB"
                          }
                        />
                      ))}
                    </div>
                    {session.feedback.from_requester.review && (
                      <p className="feedback-review">
                        {session.feedback.from_requester.review}
                      </p>
                    )}
                  </div>
                )}

                {session.feedback.from_recipient && (
                  <div className="feedback-item">
                    <p className="feedback-from">
                      From {session.recipient_id.profile.name}:
                    </p>
                    <div className="rating-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={
                            i < session.feedback.from_recipient.rating
                              ? "#FCD34D"
                              : "none"
                          }
                          stroke={
                            i < session.feedback.from_recipient.rating
                              ? "#FCD34D"
                              : "#D1D5DB"
                          }
                        />
                      ))}
                    </div>
                    {session.feedback.from_recipient.review && (
                      <p className="feedback-review">
                        {session.feedback.from_recipient.review}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowFeedbackModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Leave Feedback</h2>
            <form onSubmit={handleSubmitFeedback}>
              <div className="form-group">
                <label className="form-label">Rating *</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={32}
                      className="star-button"
                      fill={star <= feedback.rating ? "#FCD34D" : "none"}
                      stroke={star <= feedback.rating ? "#FCD34D" : "#D1D5DB"}
                      onClick={() => setFeedback({ ...feedback, rating: star })}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Review (Optional)</label>
                <textarea
                  className="form-input"
                  rows="4"
                  value={feedback.review}
                  onChange={(e) =>
                    setFeedback({ ...feedback, review: e.target.value })
                  }
                  placeholder="Share your experience..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Endorse Skills</label>
                <div className="endorsement-options">
                  <button
                    type="button"
                    className={`endorsement-btn ${
                      feedback.endorsements.includes(
                        session.skills_exchange.learning
                      )
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      toggleEndorsement(session.skills_exchange.learning)
                    }
                  >
                    {session.skills_exchange.learning}
                  </button>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Send size={18} />
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionDetails;
