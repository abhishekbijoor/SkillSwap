import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Loading from "../components/Loading";

const Callback = () => {
  const navigate = useNavigate();
  const { user, loading, isNewUser } = useUser();

  useEffect(() => {
    if (!loading && user) {
      if (isNewUser || !user.onboarding_completed) {
        navigate("/onboarding/profile-setup");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, loading, isNewUser, navigate]);

  return <Loading message="Setting up your account..." />;
};

export default Callback;
