import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
// Importing the AuthProvider higher-order state context element
import { AuthProvider } from "./context/AuthContext.jsx";

// Target the root div injection container in your index.html file
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Global State Context Injection Layer wrapping the entire Single Page Application */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
