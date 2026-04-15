import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Import context

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const { setUser } = useContext(AuthContext); // Access setUser
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Create account and get token back directly
      const res = await axios.post(
        "http://localhost:5000/api/auth/signup",
        formData,
      );
      const token = res.data.token;
      localStorage.setItem("token", token);

      // 2. Fetch user data to populate context
      const userRes = await axios.get("http://localhost:5000/api/auth/user", {
        headers: { "x-auth-token": token },
      });

      // 3. Update global state instantly
      setUser(userRes.data);

      // 4. Redirect straight to hero
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.msg || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 pt-20 px-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-3xl w-full max-w-md shadow-2xl"
      >
        <h2 className="text-3xl font-black text-white mb-6 text-center">
          Create <span className="text-green-500">Account</span>
        </h2>
        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-4 mb-4 bg-slate-800 rounded-xl text-white outline-none border border-transparent focus:border-green-500"
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-4 mb-4 bg-slate-800 rounded-xl text-white outline-none border border-transparent focus:border-green-500"
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-4 mb-6 bg-slate-800 rounded-xl text-white outline-none border border-transparent focus:border-green-500"
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />
        <button className="w-full bg-green-600 hover:bg-green-500 py-4 rounded-xl font-bold text-white transition shadow-lg shadow-green-900/20">
          Sign Up
        </button>
        <p className="text-center text-gray-400 mt-6 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-green-500 font-bold hover:underline"
          >
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}
