import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sessionAPI } from "../services/api";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import "./MySessions.css";

const MySessions = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await sessionAPI.getUserSessions();
      setSessions(response.data.sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
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
            {filteredSessions.map((session) => (
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
                      <span>{session.requester_id.profile.name}</span>
                    </div>
                    <span className="swap-arrow">↔</span>
                    <div className="user-info">
                      <User size={16} />
                      <span>{session.recipient_id.profile.name}</span>
                    </div>
                  </div>

                  <div className="session-skills">
                    <div className="skill-exchange">
                      <span className="skill-label">Teaching:</span>
                      <span className="skill-name">
                        {session.skills_exchange.teaching}
                      </span>
                    </div>
                    <span className="exchange-icon">↔</span>
                    <div className="skill-exchange">
                      <span className="skill-label">Learning:</span>
                      <span className="skill-name">
                        {session.skills_exchange.learning}
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
                </div>

                <div className="session-arrow">→</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySessions;
