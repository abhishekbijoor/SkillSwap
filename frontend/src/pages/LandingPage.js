import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, Users, Award, Shield } from "lucide-react";
import "./LandingPage.css";

const LandingPage = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <header className="hero">
        <nav className="navbar">
          <div className="container">
            <div className="nav-content">
              <h1 className="logo">SkillSwap</h1>
              <button
                className="btn btn-primary"
                onClick={() => loginWithRedirect()}
              >
                Log In
              </button>
            </div>
          </div>
        </nav>

        <div className="hero-content container">
          <div className="hero-text">
            <h1 className="hero-title">
              Learn Anything.
              <br />
              Teach Anything.
              <br />
              <span className="gradient-text">No Money Exchanged.</span>
            </h1>
            <p className="hero-subtitle">
              Connect with people worldwide to exchange skills. Trade your
              expertise for knowledge you want to gain.
            </p>
            <div className="hero-buttons">
              <button
                className="btn btn-primary btn-large"
                onClick={() => loginWithRedirect({ screen_hint: "signup" })}
              >
                Get Started <ArrowRight size={20} />
              </button>
              <button
                className="btn btn-secondary btn-large"
                onClick={() => loginWithRedirect()}
              >
                Sign In
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-card">
              <div className="card-icon">💻</div>
              <h3>Web Development</h3>
              <p>Learn React.js</p>
            </div>
            <div className="hero-card">
              <div className="card-icon">🎸</div>
              <h3>Music</h3>
              <p>Teach Guitar</p>
            </div>
            <div className="hero-card">
              <div className="card-icon">🗣️</div>
              <h3>Languages</h3>
              <p>Exchange Spanish ↔ English</p>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">How SkillSwap Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Users size={32} />
              </div>
              <h3>Create Your Profile</h3>
              <p>List skills you can teach and what you want to learn</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Zap size={32} />
              </div>
              <h3>AI-Powered Matching</h3>
              <p>Our smart algorithm finds perfect skill exchange partners</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Award size={32} />
              </div>
              <h3>Exchange & Grow</h3>
              <p>Schedule sessions, learn together, and earn badges</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Shield size={32} />
              </div>
              <h3>Verified Community</h3>
              <p>Trust badges and ratings ensure quality connections</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat">
              <h3>1000+</h3>
              <p>Active Learners</p>
            </div>
            <div className="stat">
              <h3>500+</h3>
              <p>Skills Available</p>
            </div>
            <div className="stat">
              <h3>5000+</h3>
              <p>Successful Swaps</p>
            </div>
            <div className="stat">
              <h3>50+</h3>
              <p>Countries</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Learning?</h2>
            <p>Join thousands of learners exchanging skills worldwide</p>
            <button
              className="btn btn-primary btn-large"
              onClick={() => loginWithRedirect({ screen_hint: "signup" })}
            >
              Sign Up Free <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>SkillSwap</h4>
              <p>Learn anything. Teach anything.</p>
            </div>
            <div className="footer-section">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How it Works</a>
            </div>
            <div className="footer-section">
              <h4>Legal</h4>
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 SkillSwap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
