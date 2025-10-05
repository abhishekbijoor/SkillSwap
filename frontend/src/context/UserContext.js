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
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently({
            authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
          });
          localStorage.setItem("auth_token", token);

          // Init or get user from backend
          const response = await userAPI.initUser();
          setUser(response.data.user);
          setIsNewUser(response.data.isNewUser);
        } catch (error) {
          console.error("Error initializing user:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    initializeUser();
  }, [isAuthenticated, getAccessTokenSilently]);

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  const refreshUser = async () => {
    try {
      const response = await userAPI.getCurrentUser();
      setUser(response.data.user);
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  return (
    <UserContext.Provider
      value={{ user, loading, isNewUser, auth0User, updateUser, refreshUser }}
    >
      {children}
    </UserContext.Provider>
  );
};
