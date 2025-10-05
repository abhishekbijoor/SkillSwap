import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { userAPI } from "../services/api";
import { ArrowRight } from "lucide-react";
import "./ProfileSetup.css";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();

  const [formData, setFormData] = useState({
    name: user?.profile?.name || "",
    email: user?.profile?.email || "", // Added email
    dob: "",
    phone: "",
    city: "",
    country: "",
    bio: "",
    education: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const profileData = {
        profile: {
          name: formData.name,
          email: formData.email, // Send email
          dob: formData.dob,
          phone: formData.phone,
          location: {
            city: formData.city,
            country: formData.country,
          },
          bio: formData.bio,
        },
      };

      const response = await userAPI.updateProfile(profileData);
      updateUser(response.data.user);
      navigate("/onboarding/skills");
    } catch (err) {
      console.error("Profile update error: ", err.response?.data || err);
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        <div className="progress-bar">
          <div className="progress-step active">1</div>
          <div className="progress-line"></div>
          <div className="progress-step">2</div>
          <div className="progress-line"></div>
          <div className="progress-step">3</div>
        </div>

        <div className="onboarding-content">
          <h1>Welcome to SkillSwap! 👋</h1>
          <p className="subtitle">Let's set up your profile</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date of Birth *</label>
                <input
                  type="date"
                  name="dob"
                  className="form-input"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  name="city"
                  className="form-input"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Country *</label>
                <input
                  type="text"
                  name="country"
                  className="form-input"
                  value={formData.country}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bio (Tell us about yourself)</label>
              <textarea
                name="bio"
                className="form-input"
                rows="4"
                value={formData.bio}
                onChange={handleChange}
                placeholder="I'm passionate about..."
                maxLength="500"
              />
              <span className="char-count">{formData.bio.length}/500</span>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary btn-large"
                disabled={loading}
              >
                {loading ? "Saving..." : "Continue"} <ArrowRight size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
