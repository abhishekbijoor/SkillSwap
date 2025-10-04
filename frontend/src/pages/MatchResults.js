import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Star, MapPin, Award, ArrowLeft } from "lucide-react";
import "./MatchResults.css";

const MatchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { matches = [], query = "" } = location.state || {};

  if (matches.length === 0) {
    return (
      <div className="match-results">
        <div className="container">
          <button onClick={() => navigate("/dashboard")} className="back-btn">
            <ArrowLeft size={20} /> Back to Dashboard
          </button>
          <div className="no-results">
            <h2>No matches found</h2>
            <p>Try searching for a different skill</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="match-results">
      <div className="container">
        <button onClick={() => navigate("/dashboard")} className="back-btn">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <div className="results-header">
          <h1>Match Results for "{query}"</h1>
          <p>{matches.length} compatible users found</p>
        </div>

        <div className="matches-grid">
          {matches.map((match, index) => (
            <div key={index} className="match-card">
              <div className="match-score">
                <div className="score-circle">
                  {Math.round(match.compatibility_score * 10)}%
                </div>
                <span>Match</span>
              </div>
              <div className="match-header">
                <div className="user-avatar">
                  {match.user.avatar_url ? (
                    <img src={match.user.avatar_url} alt={match.user.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {match.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="user-info">
                  <h3>{match.user.name}</h3>
                  <div className="user-meta">
                    {match.user.location?.city && (
                      <span className="location">
                        <MapPin size={14} />
                        {match.user.location.city},{" "}
                        {match.user.location.country}
                      </span>
                    )}
                    {match.user.avg_rating > 0 && (
                      <span className="rating">
                        <Star size={14} fill="#FCD34D" stroke="#FCD34D" />
                        {match.user.avg_rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="match-badges">
                {match.user.verification_badges?.map((badge, idx) => (
                  <span key={idx} className="badge badge-verified">
                    ✓ {badge}
                  </span>
                ))}
                {match.user.total_swaps > 0 && (
                  <span className="badge">
                    <Award size={14} />
                    {match.user.total_swaps} swaps
                  </span>
                )}
              </div>

              <div className="ai-explanation">
                <p className="explanation-text">{match.explanation}</p>
              </div>

              <div className="complementary-skills">
                <h4>Complementary Skills:</h4>
                <div className="skills-tags">
                  {match.complementary_skills?.map((skill, idx) => (
                    <span key={idx} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="skills-preview">
                <div className="skills-col">
                  <span className="skills-label">Can Teach:</span>
                  <div className="skills-list-mini">
                    {match.user.skills_teaching
                      ?.slice(0, 3)
                      .map((skill, idx) => (
                        <span key={idx} className="skill-mini">
                          {skill.name}
                        </span>
                      ))}
                    {match.user.skills_teaching?.length > 3 && (
                      <span className="skill-mini more">
                        +{match.user.skills_teaching.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate(`/profile/${match.user._id}`)}
                className="btn btn-primary btn-full"
              >
                View Profile & Request Swap
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchResults;
