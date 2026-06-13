// import React from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";

// // Layout & Security
// import Navbar from "./components/Navbar";
// import ProtectedRoute from "./components/ProtectedRoute";

// // Pages
// import Hero from "./components/Hero";
// import Login from "./pages/Login";
// import Signup from "./pages/Signup";
// import Audit from "./pages/Audit";
// import Dashboard from "./pages/Dashboard";

// function App() {
//   const isAuthenticated = !!localStorage.getItem("token");

//   return (
//     <Router>
//       <div className="min-h-screen bg-slate-900 text-white selection:bg-green-500/30">
//         <Navbar />
//         <Routes>
//           {/* Public Routes */}
//           <Route path="/" element={<Hero />} />
//           <Route
//             path="/login"
//             element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
//           />
//           <Route
//             path="/signup"
//             element={
//               isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />
//             }
//           />

//           {/* Private AI Intelligence Routes */}
//           <Route
//             path="/audit"
//             element={
//               <ProtectedRoute>
//                 <Audit />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/dashboard"
//             element={
//               <ProtectedRoute>
//                 <Dashboard />
//               </ProtectedRoute>
//             }
//           />

//           {/* Catch-all Redirect */}
//           <Route path="*" element={<Navigate to="/" />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Layout & Security Structural Components
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Main Application Page Modules
import Hero from "./components/Hero.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Audit from "./pages/Audit.jsx";
import Dashboard from "./pages/Dashboard.jsx";

function App() {
  // Coerce token presence to a strict boolean flag for baseline route filtering
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-white selection:bg-green-500/30">
        {/* Global Component rendered outside the switch matching mechanism to avoid persistent layout teardowns */}
        <Navbar />

        <Routes>
          {/* ================= PUBLIC PATHS ================= */}
          <Route path="/" element={<Hero />} />

          {/* Conditional Guest Constraints: Prevents active sessions from accessing auth views */}
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

          {/* ================= PRIVATE AI PORTALS ================= */}
          {/* Wrapped in HOC wrappers to intercept unauthorized coordinate processing */}
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

          {/* ================= CATCH-ALL ROUTE ================= */}
          {/* Catches non-explicit strings to bypass broken UI state issues */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
