import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect Logic: Check if the user was trying to access a specific page (like /audit)
  // If not, default to the dashboard
  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Authenticate with Node.js Backend
      // const res = await axios.post(
      //   "http://localhost:5000/api/auth/login",
      //   formData,
      // );
      const res = await axios.post(`${API_URL}/api/auth/login`, formData);
      const token = res.data.token;
      localStorage.setItem("token", token);

      // 2. Fetch the full user profile to update global state immediately
      // const userRes = await axios.get("http://localhost:5000/api/auth/user", {
      //   headers: { "x-auth-token": token },
      // });
      const userRes = await axios.get(`${API_URL}/api/auth/user`, {
        headers: { "x-auth-token": token },
      });

      // 3. Update AuthContext
      setUser(userRes.data);

      // 4. Smart Redirect: Go to intended page or Dashboard
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login failed:", err.response?.data?.msg || err.message);
      alert(
        err.response?.data?.msg || "Invalid Credentials. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 pt-20 px-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-3xl w-full max-w-md shadow-2xl transition-all hover:border-green-500/30"
      >
        <header className="mb-8 text-center">
          <h2 className="text-4xl font-black text-white tracking-tighter">
            Welcome <span className="text-green-500">Back</span>
          </h2>
          <p className="text-gray-400 text-sm mt-2 font-medium">
            Access your sustainability intelligence.
          </p>
        </header>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block tracking-widest">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@company.com"
              className="w-full p-4 bg-slate-800 rounded-xl text-white outline-none border border-transparent focus:border-green-500 transition duration-300"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block tracking-widest">
              Security Key
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-4 bg-slate-800 rounded-xl text-white outline-none border border-transparent focus:border-green-500 transition duration-300"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
        </div>

        <button className="w-full bg-green-600 hover:bg-green-500 py-4 rounded-xl font-bold text-white mt-8 transition-all shadow-lg shadow-green-900/20 active:scale-95">
          Authorize Access
        </button>

        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Don't have an intelligence account?{" "}
            <Link
              to="/signup"
              className="text-green-500 font-bold hover:text-green-400 hover:underline transition"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
