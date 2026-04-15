import React from "react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <div className="relative h-screen flex items-center justify-center bg-slate-900">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=2070')",
        }}
      ></div>
      <div className="relative z-10 text-center px-6">
        <h1 className="text-6xl md:text-8xl font-black text-white mb-6">
          Intelligence for <br />{" "}
          <span className="text-green-500">Sustainability.</span>
        </h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10">
          Analyze real estate with AI. Get high-resolution ESG scores and
          environmental intelligence in seconds.
        </p>
        <Link
          to="/signup"
          className="bg-green-600 hover:bg-green-500 text-white px-10 py-4 rounded-full font-bold text-lg transition shadow-xl"
        >
          Launch AI Audit
        </Link>
      </div>
    </div>
  );
}
