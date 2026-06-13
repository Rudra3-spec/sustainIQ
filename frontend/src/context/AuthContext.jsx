/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// Absolute Backend Gateway URL mapping to environment configuration
const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 1. Create and explicitly EXPORT the context object reference
export const AuthContext = createContext(null);

// 2. Create and explicitly EXPORT the Provider component wrapper
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        // No security session token identified, terminate initial hook verification layout smoothly
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Execute token validation sequence against your secure Express server proxy routing layer
        const res = await axios.get(`${BACKEND_URL}/api/auth/user`, {
          headers: { "x-auth-token": token },
        });

        // Set live data response to context if validated successfully by MongoDB
        setUser(res.data);
      } catch (err) {
        console.error(
          "Automated authentication verification rejected:",
          err.message,
        );
        // Wipe corrupted or expired credentials to prevent infinite redirect loops
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        // Crucial safety catch: Always force loading flag false to uncover layout interfaces
        setLoading(false);
      }
    };

    initAuth();
  }, []); // Bound strictly to an empty tracking matrix to guarantee isolated execution on boot

  // High-Level Session Modification Methods passed globally to minimize repetitive frontend handler blocks
  const login = async (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    // Hard-redirect cleans up memory cache trees completely on exit
    window.location.href = "/";
  };

  return (
    // Pass application data mutations smoothly down the rendering node architecture
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
