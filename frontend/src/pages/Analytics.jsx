import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

export default function Analytics({ latestAudit }) {
  if (!latestAudit) return null;

  // Real-world benchmarks for a more "Understandable" comparison
  const cityAverage = [50, 60, 45, 40, 55, 30, 70, 25, 65, 40, 20];
  const labels = [
    "Density",
    "Connectivity",
    "Transit",
    "AQI",
    "Green %",
    "Carbon",
    "Pop Density",
    "Crime",
    "Income",
    "Energy",
    "Risk",
  ];

  const data = latestAudit.features.map((val, i) => ({
    subject: labels[i],
    Property: val,
    CityAvg: cityAverage[i],
  }));

  return (
    <div className="bg-[#0f172a] border border-white/10 p-8 rounded-[2rem] shadow-2xl mt-8">
      <h3 className="text-2xl font-black text-white mb-2">
        Intelligence Breakdown
      </h3>
      <p className="text-gray-400 text-sm mb-8 font-medium italic">
        Blue area represents the city benchmark. Green represents your asset's
        performance.
      </p>

      {/* Increased height and better color contrast */}
      <div className="h-[450px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#334155" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: "bold" }}
            />
            <Radar
              name="Your Property"
              dataKey="Property"
              stroke="#22c55e"
              fill="#22c55e"
              fillOpacity={0.6}
            />
            <Radar
              name="Regional Average"
              dataKey="CityAvg"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.2}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "none",
                borderRadius: "12px",
                color: "#fff",
              }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
