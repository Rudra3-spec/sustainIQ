import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// 1. Create and EXPORT the context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        // No token found, stop loading immediately
        setLoading(false);
        return;
      }

      try {
        // Verify user with your backend
        const res = await axios.get("http://localhost:5000/api/auth/user", {
          headers: { "x-auth-token": token },
        });

        // If successful, set the user data
        setUser(res.data);
      } catch (err) {
        console.error("Auth verification failed:", err.message);
        // Clear invalid token
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        // Crucial: Always set loading to false after the attempt
        setLoading(false);
      }
    };

    initAuth();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    // 2. Pass user, setUser, and loading as the value
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
