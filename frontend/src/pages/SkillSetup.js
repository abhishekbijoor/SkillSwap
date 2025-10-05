import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { userAPI } from "../services/api";
import { Plus, X, ArrowRight, Award } from "lucide-react";
import "./SkillSetup.css";

const SkillSetup = () => {
  const navigate = useNavigate();
  const { updateUser } = useUser();

  const [skillsTeaching, setSkillsTeaching] = useState([]);
  const [skillsLearning, setSkillsLearning] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Teaching skill form
  const [teachingForm, setTeachingForm] = useState({
    name: "",
    proficiency: "Intermediate",
    years_experience: "1-3",
    willing_to_teach: true,
  });

  // Certifications for current teaching skill being added
  const [certifications, setCertifications] = useState([]);
  const [certForm, setCertForm] = useState({
    name: "",
    issuing_org: "",
    issue_date: "",
    credential_url: "",
  });

  const [showCertModal, setShowCertModal] = useState(false);

  // Learning skill form
  const [learningForm, setLearningForm] = useState({
    name: "",
    current_level: "Beginner",
    goal: "Hobby",
    urgency: "Medium",
  });

  const addCertification = (e) => {
    e.preventDefault();
    if (certForm.name.trim() && certForm.issuing_org.trim()) {
      setCertifications([...certifications, certForm]);
      setCertForm({
        name: "",
        issuing_org: "",
        issue_date: "",
        credential_url: "",
      });
      setShowCertModal(false);
    }
  };

  const removeCertification = (index) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const addTeachingSkill = (e) => {
    e.preventDefault();
    if (teachingForm.name.trim()) {
      setSkillsTeaching([
        ...skillsTeaching,
        { ...teachingForm, certifications: certifications },
      ]);
      setTeachingForm({
        name: "",
        proficiency: "Intermediate",
        years_experience: "1-3",
        willing_to_teach: true,
      });
      setCertifications([]);
    }
  };

  const addLearningSkill = (e) => {
    e.preventDefault();
    if (learningForm.name.trim()) {
      setSkillsLearning([...skillsLearning, learningForm]);
      setLearningForm({
        name: "",
        current_level: "Beginner",
        goal: "Hobby",
        urgency: "Medium",
      });
    }
  };

  const removeTeachingSkill = (index) => {
    setSkillsTeaching(skillsTeaching.filter((_, i) => i !== index));
  };

  const removeLearningSkill = (index) => {
    setSkillsLearning(skillsLearning.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (skillsTeaching.length === 0 && skillsLearning.length === 0) {
      setError("Please add at least one skill");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await userAPI.updateSkills({
        skills_teaching: skillsTeaching,
        skills_learning: skillsLearning,
      });

      updateUser(response.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save skills");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-container large">
        <div className="progress-bar">
          <div className="progress-step completed">✓</div>
          <div className="progress-line active"></div>
          <div className="progress-step active">2</div>
          <div className="progress-line"></div>
          <div className="progress-step">3</div>
        </div>

        <div className="onboarding-content">
          <h1>What skills do you have? 🎯</h1>
          <p className="subtitle">Add skills you can teach and want to learn</p>

          {error && <div className="error-message">{error}</div>}

          <div className="skills-section">
            <h2>Skills I Can Teach</h2>

            <form onSubmit={addTeachingSkill} className="skill-form">
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., JavaScript, Guitar, Spanish..."
                    value={teachingForm.name}
                    onChange={(e) =>
                      setTeachingForm({ ...teachingForm, name: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <select
                    className="form-input"
                    value={teachingForm.proficiency}
                    onChange={(e) =>
                      setTeachingForm({
                        ...teachingForm,
                        proficiency: e.target.value,
                      })
                    }
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div className="form-group">
                  <select
                    className="form-input"
                    value={teachingForm.years_experience}
                    onChange={(e) =>
                      setTeachingForm({
                        ...teachingForm,
                        years_experience: e.target.value,
                      })
                    }
                  >
                    <option value="0-1">0-1 years</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary">
                  <Plus size={20} />
                </button>
              </div>

              {/* Certifications Section */}
              <div className="certifications-section">
                <div className="cert-header">
                  <h4>Certifications (Optional)</h4>
                  <button
                    type="button"
                    onClick={() => setShowCertModal(true)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Award size={16} /> Add Certification
                  </button>
                </div>

                {certifications.length > 0 && (
                  <div className="cert-list">
                    {certifications.map((cert, index) => (
                      <div key={index} className="cert-item">
                        <div className="cert-info">
                          <Award size={16} className="cert-icon" />
                          <div>
                            <strong>{cert.name}</strong>
                            <span className="cert-org">
                              {cert.issuing_org}
                              {cert.issue_date &&
                                ` • ${new Date(
                                  cert.issue_date
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                })}`}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCertification(index)}
                          className="remove-cert-btn"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>

            <div className="skills-list">
              {skillsTeaching.map((skill, index) => (
                <div key={index} className="skill-card">
                  <div className="skill-info">
                    <h3>{skill.name}</h3>
                    <div className="skill-details">
                      <span className="badge badge-skill">
                        {skill.proficiency}
                      </span>
                      <span className="skill-exp">
                        {skill.years_experience} experience
                      </span>
                      {skill.certifications && skill.certifications.length > 0 && (
                        <span className="cert-badge">
                          <Award size={14} /> {skill.certifications.length}{" "}
                          certification{skill.certifications.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeTeachingSkill(index)}
                    className="remove-btn"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="skills-section">
            <h2>Skills I Want to Learn</h2>

            <form onSubmit={addLearningSkill} className="skill-form">
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Python, Photography, French..."
                    value={learningForm.name}
                    onChange={(e) =>
                      setLearningForm({ ...learningForm, name: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <select
                    className="form-input"
                    value={learningForm.current_level}
                    onChange={(e) =>
                      setLearningForm({
                        ...learningForm,
                        current_level: e.target.value,
                      })
                    }
                  >
                    <option value="Never tried">Never tried</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Some experience">Some experience</option>
                  </select>
                </div>

                <div className="form-group">
                  <select
                    className="form-input"
                    value={learningForm.goal}
                    onChange={(e) =>
                      setLearningForm({ ...learningForm, goal: e.target.value })
                    }
                  >
                    <option value="Hobby">Hobby</option>
                    <option value="Career Growth">Career Growth</option>
                    <option value="Personal Project">Personal Project</option>
                    <option value="Teaching Others">Teaching Others</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary">
                  <Plus size={20} />
                </button>
              </div>
            </form>

            <div className="skills-list">
              {skillsLearning.map((skill, index) => (
                <div key={index} className="skill-card learning">
                  <div className="skill-info">
                    <h3>{skill.name}</h3>
                    <div className="skill-details">
                      <span className="badge">{skill.current_level}</span>
                      <span className="skill-exp">Goal: {skill.goal}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeLearningSkill(index)}
                    className="remove-btn"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button
              onClick={handleSubmit}
              className="btn btn-primary btn-large"
              disabled={loading}
            >
              {loading ? "Saving..." : "Complete Setup"}{" "}
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Certification Modal */}
      {showCertModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCertModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Certification</h2>
            <form onSubmit={addCertification}>
              <div className="form-group">
                <label className="form-label">Certification Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., AWS Certified Solutions Architect"
                  value={certForm.name}
                  onChange={(e) =>
                    setCertForm({ ...certForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Issuing Organization *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Amazon Web Services"
                  value={certForm.issuing_org}
                  onChange={(e) =>
                    setCertForm({ ...certForm, issuing_org: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Issue Date (Optional)</label>
                <input
                  type="date"
                  className="form-input"
                  value={certForm.issue_date}
                  onChange={(e) =>
                    setCertForm({ ...certForm, issue_date: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Credential URL (Optional)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://..."
                  value={certForm.credential_url}
                  onChange={(e) =>
                    setCertForm({ ...certForm, credential_url: e.target.value })
                  }
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowCertModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Certification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillSetup;
