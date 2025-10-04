import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { UserProvider } from "./context/UserContext";

// Components
import LandingPage from "./pages/LandingPage";
import Callback from "./pages/Callback.js";
import ProfileSetup from "./pages/ProfileSetup";
import SkillSetup from "./pages/SkillSetup";
import Dashboard from "./pages/Dashboard";
import MatchResults from "./pages/MatchResults";
import UserProfile from "./pages/UserProfile";
import SessionDetails from "./pages/SessionDetails";
import MySessions from "./pages/MySessions";
import Loading from "./components/Loading";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <UserProvider>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/callback" element={<Callback />} />

          {/* Protected Routes */}
          <Route
            path="/onboarding/profile-setup"
            element={
              // <ProtectedRoute>
              <ProfileSetup />
              // </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/skills"
            element={
              <ProtectedRoute>
                <SkillSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              // <ProtectedRoute>
              <Dashboard />
              // </ProtectedRoute>
            }
          />
          <Route
            path="/matches"
            element={
              // <ProtectedRoute>
              <MatchResults />
              // </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              // <ProtectedRoute>
              <UserProfile />
              // </ProtectedRoute>
            }
          />
          <Route
            path="/sessions"
            element={
              // <ProtectedRoute>
              <MySessions />
              // </ProtectedRoute>
            }
          />
          <Route
            path="/session/:sessionId"
            element={
              // <ProtectedRoute>
              <SessionDetails />
              // </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </UserProvider>
  );
}

export default App;
