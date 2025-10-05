import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI } from "../services/api";
import { ArrowLeft, Trophy, Star, Award, TrendingUp } from "lucide-react";
import "./Leaderboard.css";

const Leaderboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [topRated, setTopRated] = useState([]);
  const [topSwaps, setTopSwaps] = useState([]);
  const [activeTab, setActiveTab] = useState("rating");

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await userAPI.getLeaderboard();
      setTopRated(response.data.topRated || []);
      setTopSwaps(response.data.topSwaps || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const renderLeaderboardList = (users, type) => {
    if (users.length === 0) {
      return (
        <div className="no-data">
          <Trophy size={48} />
          <p>No users on the leaderboard yet. Be the first!</p>
        </div>
      );
    }

    return (
      <div className="leaderboard-list">
        {users.map((user, index) => (
          <div key={user._id} className={`leaderboard-item rank-${index + 1}`}>
            <div className="rank">{getRankIcon(index + 1)}</div>

            <div className="user-avatar">
              {user.profile.avatar_url ? (
                <img src={user.profile.avatar_url} alt={user.profile.name} />
              ) : (
                <div className="avatar-placeholder">
                  {user.profile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="user-details">
              <h3>{user.profile.name}</h3>
              <div className="user-skills">
                {user.skills_teaching.slice(0, 3).map((skill, idx) => (
                  <span key={idx} className="skill-badge">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="user-stats">
              {type === "rating" ? (
                <>
                  <div className="stat-item">
                    <Star size={16} fill="#ffc107" stroke="#ffc107" />
                    <span className="stat-value">{user.stats.avg_rating.toFixed(1)}</span>
                  </div>
                  <div className="stat-item secondary">
                    <Award size={14} />
                    <span className="stat-label">{user.stats.total_swaps} swaps</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="stat-item">
                    <Award size={16} />
                    <span className="stat-value">{user.stats.total_swaps}</span>
                  </div>
                  <div className="stat-item secondary">
                    <Star size={14} fill="#ffc107" stroke="#ffc107" />
                    <span className="stat-label">{user.stats.avg_rating.toFixed(1)} rating</span>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="leaderboard-page">
      <div className="container">
        <button onClick={() => navigate("/dashboard")} className="back-btn">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <div className="leaderboard-header">
          <div className="header-content">
            <Trophy size={48} className="trophy-icon" />
            <div>
              <h1>Leaderboard</h1>
              <p>Top performers in the SkillSwap community</p>
            </div>
          </div>
        </div>

        <div className="leaderboard-tabs">
          <button
            className={`tab-btn ${activeTab === "rating" ? "active" : ""}`}
            onClick={() => setActiveTab("rating")}
          >
            <Star size={20} />
            Top Rated
          </button>
          <button
            className={`tab-btn ${activeTab === "swaps" ? "active" : ""}`}
            onClick={() => setActiveTab("swaps")}
          >
            <TrendingUp size={20} />
            Most Swaps
          </button>
        </div>

        <div className="leaderboard-content">
          {activeTab === "rating"
            ? renderLeaderboardList(topRated, "rating")
            : renderLeaderboardList(topSwaps, "swaps")}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
