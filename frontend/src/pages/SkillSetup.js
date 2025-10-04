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

  // Learning skill form
  const [learningForm, setLearningForm] = useState({
    name: "",
    current_level: "Beginner",
    goal: "Hobby",
    urgency: "Medium",
  });

  const addTeachingSkill = (e) => {
    e.preventDefault();
    if (teachingForm.name.trim()) {
      setSkillsTeaching([
        ...skillsTeaching,
        { ...teachingForm, certifications: [] },
      ]);
      setTeachingForm({
        name: "",
        proficiency: "Intermediate",
        years_experience: "1-3",
        willing_to_teach: true,
      });
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
    </div>
  );
};

export default SkillSetup;
