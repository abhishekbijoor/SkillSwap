import React, { createContext, useState, useEffect, useContext } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { userAPI } from "../services/api";

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const { isAuthenticated, getAccessTokenSilently, user: auth0User } = useAuth0();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const initializeUser = async () => {
      if (!isAuthenticated || !auth0User) {
        setLoading(false);
        return;
      }

      try {
        // Get access token
        const token = await getAccessTokenSilently();
        localStorage.setItem("auth_token", token);

        // Get or create user in backend
        const response = await userAPI.initUser(token); // Ensure token is passed to API
        if (response?.data?.user) {
          setUser(response.data.user);
          setIsNewUser(response.data.isNewUser || false);
        } else {
          console.error("No user returned from API:", response);
        }
      } catch (error) {
        console.error("Error initializing user:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, [isAuthenticated, auth0User, getAccessTokenSilently]);

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  const refreshUser = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await userAPI.getCurrentUser(token); // Pass token
      if (response?.data?.user) setUser(response.data.user);
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        isNewUser,
        auth0User,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
