import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, LayoutDashboard, Search, LogOut, User } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="fixed w-full z-50 flex justify-between items-center px-10 py-6 bg-slate-900/40 backdrop-blur-xl border-b border-white/5">
      <Link
        to="/"
        className="flex items-center gap-2 text-2xl font-black text-white group"
      >
        <Leaf
          className="text-green-500 group-hover:rotate-12 transition-transform"
          size={28}
        />
        SUSTAIN<span className="text-green-500">IQ</span>
      </Link>

      <div className="flex items-center gap-8 font-bold text-sm uppercase tracking-widest">
        {user ? (
          <>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition"
            >
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link
              to="/audit"
              className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition"
            >
              <Search size={18} /> AI Audit
            </Link>

            <div className="flex items-center gap-3 ml-4 border-l border-white/10 pl-8">
              <span className="text-green-500 lowercase flex items-center gap-2">
                <User size={14} /> {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500/10 text-red-400 px-5 py-2 rounded-full hover:bg-red-500 hover:text-white transition-all capitalize"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link
              to="/"
              className="text-gray-300 hover:text-green-400 transition"
            >
              Home
            </Link>
            <Link
              to="/login"
              className="bg-green-600 hover:bg-green-700 px-8 py-2 rounded-full text-white transition shadow-lg shadow-green-900/20"
            >
              Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
