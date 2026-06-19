import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../shared/api/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Authenticate user on page load
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("aura_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/profile");
        setUser(response.data.user);
      } catch (err) {
        console.error("Session auto-login failed:", err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/login", { email, password });
      localStorage.setItem("aura_token", response.token);
      setUser(response.data.user);
      return response.data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role = "customer") => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });
      localStorage.setItem("aura_token", response.token);
      setUser(response.data.user);
      return response.data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("aura_token");
    setUser(null);
  };

  const updateProfile = async (name, email) => {
    setLoading(true);
    try {
      const response = await api.put("/auth/profile", { name, email });
      setUser(response.data.user);
      return response.data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user && user.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
