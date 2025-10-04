import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useUser } from "../context/UserContext";
import { matchAPI } from "../services/api";
import {
  Search,
  LogOut,
  User,
  Star,
  Award,
  TrendingUp,
  Calendar,
} from "lucide-react";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth0();
  const { user } = useUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  // In Dashboard.js, update the handleSearch function
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please complete your profile setup first");
      navigate("/onboarding/profile-setup");
      return;
    }

    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await matchAPI.findMatches({
        skill_query: searchQuery,
        filters: {},
      });

      navigate("/matches", {
        state: { matches: response.data.matches, query: searchQuery },
      });
    } catch (error) {
      console.error("Search error:", error);
      alert("Failed to find matches. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleLogout = () => {
    logout({ returnTo: window.location.origin });
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <h1 className="logo">SkillSwap</h1>
            <nav className="nav-menu">
              <button
                onClick={() => navigate("/sessions")}
                className="nav-link"
              >
                <Calendar size={20} />
                My Sessions
              </button>
              <button
                onClick={() => navigate(`/profile/${user._id}`)}
                className="nav-link"
              >
                <User size={20} />
                Profile
              </button>
              <button onClick={handleLogout} className="nav-link">
                <LogOut size={20} />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container dashboard-content">
        {/* Welcome Section */}
        <section className="welcome-section">
          <div className="welcome-text">
            <h2>Welcome back, {user?.profile?.name}! 👋</h2>
            <p>Ready to exchange some skills today?</p>
          </div>
          <div className="verification-status">
            {user?.verification?.badges?.includes("email") && (
              <span className="badge badge-verified">✓ Email Verified</span>
            )}
            {user?.verification?.status === "verified" && (
              <span className="badge badge-verified">✓ Verified User</span>
            )}
          </div>
        </section>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Award size={24} />
            </div>
            <div className="stat-info">
              <h3>{user?.stats?.total_swaps || 0}</h3>
              <p>Total Swaps</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Star size={24} />
            </div>
            <div className="stat-info">
              <h3>{user?.stats?.avg_rating?.toFixed(1) || "0.0"}</h3>
              <p>Average Rating</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-info">
              <h3>{user?.skills_teaching?.length || 0}</h3>
              <p>Skills Teaching</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Search size={24} />
            </div>
            <div className="stat-info">
              <h3>{user?.skills_learning?.length || 0}</h3>
              <p>Skills Learning</p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <section className="search-section">
          <h2>Find Your Next Learning Partner</h2>
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                className="search-input"
                placeholder="What skill do you want to learn? (e.g., Python, Guitar, Spanish...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={searching}
              >
                {searching ? "Searching..." : "Find Matches"}
              </button>
            </div>
          </form>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h3>Your Skills</h3>
          <div className="skills-overview">
            <div className="skills-column">
              <h4>Teaching ({user?.skills_teaching?.length || 0})</h4>
              <div className="skill-tags">
                {user?.skills_teaching?.map((skill, index) => (
                  <span key={index} className="skill-tag teaching">
                    {skill.name}{" "}
                    <span className="proficiency">({skill.proficiency})</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="skills-column">
              <h4>Learning ({user?.skills_learning?.length || 0})</h4>
              <div className="skill-tags">
                {user?.skills_learning?.map((skill, index) => (
                  <span key={index} className="skill-tag learning">
                    {skill.name} <span className="goal">- {skill.goal}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
