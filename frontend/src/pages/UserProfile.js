import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userAPI, sessionAPI } from "../services/api";
import { useUser } from "../context/UserContext";
import { ArrowLeft, MapPin, Star, Award, Send, Shield } from "lucide-react";
import "./UserProfile.css";

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, loading: userLoading } = useUser();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestData, setRequestData] = useState({
    teaching_skill: "",
    learning_skill: "",
    message: "",
    format: "Video call",
    scheduled_at: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userAPI.getUserById(userId);
        setProfile(response.data.user);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const handleSendRequest = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("Please log in to send requests");
      return;
    }

    // Validate required fields
    if (!requestData.teaching_skill || !requestData.learning_skill) {
      alert("Please select both skills for the exchange");
      return;
    }

    try {
      console.log("Sending swap request:", {
        recipient_id: userId,
        teaching_skill: requestData.teaching_skill,
        learning_skill: requestData.learning_skill,
        format: requestData.format,
      });

      const response = await sessionAPI.createSwapRequest({
        recipient_id: userId,
        skills_exchange: {
          teaching: requestData.teaching_skill,
          learning: requestData.learning_skill,
        },
        message: requestData.message,
        format: requestData.format,
        scheduled_at: requestData.scheduled_at || null,
      });

      console.log("Swap request created:", response.data);

      alert("Swap request sent successfully!");
      setShowRequestModal(false);
      navigate("/sessions");
    } catch (error) {
      console.error("Error sending request:", error.response?.data || error);
      const errorMessage = error.response?.data?.error || "Failed to send request. Please try again.";
      alert(errorMessage);
    }
  };

  // Show loading state while either user context or profile is loading
  if (loading || userLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-message">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="user-profile-page">
        <div className="container">
          <button onClick={() => navigate(-1)} className="back-btn">
            <ArrowLeft size={20} /> Back
          </button>
          <div className="error-page">
            <h2>User not found</h2>
            <p>The profile you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if viewing own profile
  const isOwnProfile = currentUser && currentUser._id === userId || currentUser && String(currentUser._id) === String(userId);

  return (
    <div className="user-profile-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={20} /> Back
        </button>

        <div className="profile-layout">
          {/* Profile Sidebar */}
          <aside className="profile-sidebar">
            <div className="profile-card">
              <div className="profile-avatar-large">
                {profile.profile.avatar_url ? (
                  <img
                    src={profile.profile.avatar_url}
                    alt={profile.profile.name}
                  />
                ) : (
                  <div className="avatar-placeholder-large">
                    {profile.profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <h2>{profile.profile.name}</h2>

              <div className="profile-meta">
                {profile.profile.location?.city && (
                  <div className="meta-item">
                    <MapPin size={16} />
                    {profile.profile.location.city},{" "}
                    {profile.profile.location.country}
                  </div>
                )}
              </div>

              <div className="verification-badges">
                {profile.verification.badges?.map((badge, idx) => (
                  <span key={idx} className="badge badge-verified">
                    <Shield size={14} /> {badge}
                  </span>
                ))}
              </div>

              {profile.profile.bio && (
                <div className="profile-bio">
                  <h3>About</h3>
                  <p>{profile.profile.bio}</p>
                </div>
              )}

              <div className="profile-stats">
                <div className="stat-item">
                  <Award size={20} />
                  <div>
                    <strong>{profile.stats.total_swaps || 0}</strong>
                    <span>Swaps</span>
                  </div>
                </div>
                <div className="stat-item">
                  <Star size={20} fill="#FCD34D" stroke="#FCD34D" />
                  <div>
                    <strong>
                      {profile.stats.avg_rating?.toFixed(1) || "0.0"}
                    </strong>
                    <span>Rating</span>
                  </div>
                </div>
              </div>

              {!isOwnProfile && currentUser && (
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="btn btn-primary btn-full"
                >
                  <Send size={18} />
                  Request Skill Swap
                </button>
              )}

              {isOwnProfile && (
                <button
                  onClick={() => navigate("/onboarding/skills")}
                  className="btn btn-secondary btn-full"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </aside>

          {/* Profile Content */}
          <main className="profile-content">
            {/* Skills Teaching */}
            <section className="skills-section">
              <h2>
                Skills I Can Teach ({profile.skills_teaching?.length || 0})
              </h2>
              {profile.skills_teaching && profile.skills_teaching.length > 0 ? (
                <div className="skills-grid">
                  {profile.skills_teaching.map((skill, index) => (
                    <div key={index} className="skill-card-detail">
                      <h3>{skill.name}</h3>
                      <div className="skill-meta">
                        <span className="badge badge-skill">
                          {skill.proficiency}
                        </span>
                        <span className="experience">
                          {skill.years_experience} experience
                        </span>
                      </div>
                      {skill.certifications &&
                        skill.certifications.length > 0 && (
                          <div className="certifications">
                            <Award size={16} />
                            <span>
                              {skill.certifications.length} certification(s)
                            </span>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-skills">No teaching skills added yet.</p>
              )}
            </section>

            {/* Skills Learning */}
            <section className="skills-section">
              <h2>
                Skills I Want to Learn ({profile.skills_learning?.length || 0})
              </h2>
              {profile.skills_learning && profile.skills_learning.length > 0 ? (
                <div className="skills-grid">
                  {profile.skills_learning.map((skill, index) => (
                    <div key={index} className="skill-card-detail learning">
                      <h3>{skill.name}</h3>
                      <div className="skill-meta">
                        <span className="badge">{skill.current_level}</span>
                        <span className="goal">Goal: {skill.goal}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-skills">No learning goals added yet.</p>
              )}
            </section>

            {/* Education */}
            {profile.profile.education &&
              profile.profile.education.length > 0 && (
                <section className="education-section">
                  <h2>Education</h2>
                  {profile.profile.education.map((edu, index) => (
                    <div key={index} className="education-item">
                      <h3>
                        {edu.degree} in {edu.field}
                      </h3>
                      <p>{edu.institution}</p>
                      <span className="edu-years">{edu.years}</span>
                    </div>
                  ))}
                </section>
              )}
          </main>
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && currentUser && (
        <div
          className="modal-overlay"
          onClick={() => setShowRequestModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Request Skill Swap</h2>
            <form onSubmit={handleSendRequest}>
              <div className="form-group">
                <label className="form-label">
                  What do you want to learn? *
                </label>
                <select
                  className="form-input"
                  value={requestData.learning_skill}
                  onChange={(e) =>
                    setRequestData({
                      ...requestData,
                      learning_skill: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select a skill...</option>
                  {profile.skills_teaching?.map((skill, idx) => (
                    <option key={idx} value={skill.name}>
                      {skill.name} ({skill.proficiency})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  What can you teach in return? *
                </label>
                <select
                  className="form-input"
                  value={requestData.teaching_skill}
                  onChange={(e) =>
                    setRequestData({
                      ...requestData,
                      teaching_skill: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select a skill...</option>
                  {currentUser.skills_teaching &&
                  currentUser.skills_teaching.length > 0 ? (
                    currentUser.skills_teaching.map((skill, idx) => (
                      <option key={idx} value={skill.name}>
                        {skill.name} ({skill.proficiency})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No teaching skills added
                    </option>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Message (Optional)</label>
                <textarea
                  className="form-input"
                  rows="4"
                  value={requestData.message}
                  onChange={(e) =>
                    setRequestData({ ...requestData, message: e.target.value })
                  }
                  placeholder="Introduce yourself and explain why you're interested..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Format</label>
                <select
                  className="form-input"
                  value={requestData.format}
                  onChange={(e) =>
                    setRequestData({ ...requestData, format: e.target.value })
                  }
                >
                  <option value="Video call">Video Call</option>
                  <option value="In-person">In-Person</option>
                  <option value="Chat-based">Chat-Based</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Preferred Date/Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={requestData.scheduled_at}
                  onChange={(e) =>
                    setRequestData({
                      ...requestData,
                      scheduled_at: e.target.value,
                    })
                  }
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
