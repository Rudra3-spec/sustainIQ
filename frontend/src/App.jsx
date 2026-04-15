import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Layout & Security
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Hero from "./components/Hero";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Audit from "./pages/Audit";
import Dashboard from "./pages/Dashboard";

function App() {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-white selection:bg-green-500/30">
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Hero />} />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route
            path="/signup"
            element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />
            }
          />

          {/* Private AI Intelligence Routes */}
          <Route
            path="/audit"
            element={
              <ProtectedRoute>
                <Audit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
