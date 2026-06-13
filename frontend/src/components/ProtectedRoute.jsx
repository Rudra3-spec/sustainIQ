import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // 1. Maintain layout stability while loading session authentication states
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-medium tracking-wide text-sm animate-pulse">
          Verifying Security Clearance...
        </p>
      </div>
    );
  }

  // 2. Dual-verification security check: State check with explicit localStorage fallback
  const token = localStorage.getItem("token");
  const isAuthenticated = user || !!token;

  if (!isAuthenticated) {
    console.warn(
      `Unauthorized route access blocked: ${location.pathname}. Redirecting to auth gateway.`,
    );
    // We pass the intended destination state inside the redirect payload to allow seamless post-login navigation
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Render secure children routes if credentials validate successfully
  return children;
};

export default ProtectedRoute;
