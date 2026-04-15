import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Activity,
  ShieldCheck,
  Globe,
  Clock,
  ChevronRight,
  Download,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  // Pull user and loading state from context
  const auth = useContext(AuthContext);

  if (!auth) return null;

  const { user, loading } = auth;
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ avg: 0, total: 0 });
  const [rawAudits, setRawAudits] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { "x-auth-token": token },
        });

        const audits = res.data.audits || [];
        setRawAudits(audits); // Keep original order for logs/export

        // Chart data: Oldest to Newest
        const chartData = [...audits].reverse().map((a, i) => ({
          name: `Audit ${i + 1}`,
          score: (a.score * 100).toFixed(1),
        }));
        setHistory(chartData);

        // Calculate Global Stats
        const total = audits.length;
        const avg =
          total > 0
            ? (
                (audits.reduce((acc, curr) => acc + curr.score, 0) / total) *
                100
              ).toFixed(1)
            : 0;
        setStats({ avg, total });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    if (!loading) {
      fetchHistory();
    }
  }, [loading]);

  // CSV EXPORT LOGIC
  const downloadCSV = () => {
    if (rawAudits.length === 0) return alert("No data available to export");

    const headers = [
      "Date",
      "Sustainability_Score",
      "Building_Density",
      "Road_Connectivity",
      "Public_Transit",
      "AQI",
      "Green_Cover",
      "Carbon_Footprint",
      "Pop_Density",
      "Crime_Rate",
      "Avg_Income",
      "Renewable_Energy",
      "Disaster_Risk",
    ];

    const csvRows = rawAudits.map((audit) => {
      const date = new Date(audit.date).toLocaleDateString();
      const score = (audit.score * 100).toFixed(2);
      const features = audit.features.join(",");
      return `${date},${score}%,${features}`;
    });

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute(
      "download",
      `SustainIQ_Audit_Report_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Prevent crash if context is still loading
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-black tracking-widest uppercase">
        Loading Intelligence...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-28 px-10 pb-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
              Intelligence{" "}
              <span className="text-green-500 underline decoration-green-500/30">
                Overview
              </span>
            </h1>
            <p className="text-gray-400 mt-2 italic text-sm">
              Logged in as:{" "}
              <span className="text-green-400 font-bold">
                {user?.name || "Architect"}
              </span>{" "}
              •{" "}
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-2xl font-bold text-sm transition shadow-lg shadow-green-900/20 active:scale-95"
          >
            <Download size={18} /> Export CSV Report
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center gap-4 transition hover:border-green-500/50 group">
            <div className="bg-green-500/10 p-4 rounded-2xl text-green-500 group-hover:scale-110 transition text-green-500">
              <Globe size={32} />
            </div>
            <div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                Avg Sustainability
              </p>
              <h3 className="text-4xl font-black text-white">{stats.avg}%</h3>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center gap-4 transition hover:border-blue-500/50 group">
            <div className="bg-blue-500/10 p-4 rounded-2xl text-blue-500 group-hover:scale-110 transition text-blue-500">
              <Activity size={32} />
            </div>
            <div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                Total Audits
              </p>
              <h3 className="text-4xl font-black text-white">{stats.total}</h3>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center gap-4 transition hover:border-purple-500/50 group">
            <div className="bg-purple-500/10 p-4 rounded-2xl text-purple-500 group-hover:scale-110 transition text-purple-500">
              <ShieldCheck size={32} />
            </div>
            <div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                ESG Risk Level
              </p>
              <h3 className="text-4xl font-black text-white">
                {stats.avg > 70 ? "LOW" : stats.avg > 40 ? "MEDIUM" : "HIGH"}
              </h3>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl rounded-full"></div>
            <div className="flex items-center gap-2 mb-8 text-green-500">
              <Activity size={20} />
              <h3 className="text-xl font-bold text-white tracking-tight">
                AI Intelligence Trajectory
              </h3>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid
                    strokeDasharray="5 5"
                    stroke="#1e293b"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#475569"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#475569"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    cursor={{ stroke: "#22c55e", strokeWidth: 2 }}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid rgba(34, 197, 94, 0.2)",
                      borderRadius: "16px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    itemStyle={{ color: "#22c55e", fontWeight: "900" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#22c55e"
                    strokeWidth={5}
                    dot={{
                      r: 6,
                      fill: "#22c55e",
                      strokeWidth: 3,
                      stroke: "#0f172a",
                    }}
                    activeDot={{ r: 8, strokeWidth: 0, fill: "#4ade80" }}
                    animationDuration={2000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side History Feed */}
          <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-500">
                <Clock size={18} />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">
                  Recent Logs
                </h3>
              </div>
              <span className="text-[10px] bg-slate-800 px-3 py-1 rounded-full text-green-400 font-black tracking-widest">
                STABLE
              </span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[400px] divide-y divide-white/5">
              {rawAudits.length > 0 ? (
                rawAudits.slice(0, 10).map((audit, i) => (
                  <div
                    key={i}
                    className="p-5 hover:bg-white/5 transition flex items-center justify-between group cursor-default"
                  >
                    <div>
                      <p className="text-white font-black text-xl tracking-tighter">
                        {(audit.score * 100).toFixed(1)}%
                      </p>
                      <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                        {new Date(audit.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        audit.score > 0.7
                          ? "bg-green-500/5 text-green-500 border-green-500/20"
                          : "bg-yellow-500/5 text-yellow-500 border-yellow-500/20"
                      }`}
                    >
                      {audit.score > 0.7 ? "Optimal" : "Moderate"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-600">
                  <Activity size={40} className="mx-auto mb-4 opacity-10" />
                  <p className="text-xs uppercase font-bold tracking-widest">
                    No Intelligence Records
                  </p>
                </div>
              )}
            </div>

            <button className="w-full p-5 bg-green-600/5 text-green-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-green-600 hover:text-white transition flex items-center justify-center gap-3 group">
              Full System History{" "}
              <ChevronRight
                size={14}
                className="group-hover:translate-x-1 transition"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
