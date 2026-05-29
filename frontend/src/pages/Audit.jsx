import React, { useState, useContext, useRef } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { AuthContext } from "../context/AuthContext";
import Analytics from "./Analytics";

const BACKEND_URL = "https://sustain-iq-backend.onrender.com";
const ML_URL = "https://sustain-iq-ml.onrender.com";

export default function Audit() {
  const { user } = useContext(AuthContext);
  const [features, setFeatures] = useState(Array(11).fill(""));
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [latestAuditData, setLatestAuditData] = useState(null);

  // Use a ref for the certificate to ensure accurate PDF capture
  const certificateRef = useRef(null);

  const labels = [
    "Building Density",
    "Road Connectivity",
    "Public Transit Access",
    "Air Quality Index",
    "Green Cover %",
    "Carbon Footprint",
    "Population Density",
    "Crime Rate",
    "Avg Income",
    "Renewable Energy",
    "Disaster Risk",
  ];

  const getBadge = (score) => {
    if (score >= 0.8)
      return {
        label: "GOLD",
        color: "text-yellow-500",
        border: "border-yellow-500/50",
        shadow: "shadow-yellow-500/20",
      };
    if (score >= 0.6)
      return {
        label: "SILVER",
        color: "text-slate-300",
        border: "border-slate-400/50",
        shadow: "shadow-slate-400/20",
      };
    return {
      label: "BRONZE",
      color: "text-orange-600",
      border: "border-orange-700/50",
      shadow: "shadow-orange-900/20",
    };
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Convert strings to Floats and Log them for debugging
    const featureArray = features.map((val) => {
      const num = parseFloat(val);
      return isNaN(num) ? 0 : num;
    });

    // DEBUG: Check your console (F12) to see if these numbers are changing
    console.log("--- New Audit Initiated ---");
    console.log("Payload being sent to Flask:", featureArray);

    const token = localStorage.getItem("token");

    try {
      // 2. Get Prediction from Flask (Port 5001)
      // const mlRes = await axios.post("http://localhost:5001/predict", {
      //   features: featureArray,
      // });
      const mlRes = await axios.post(`${ML_URL}/predict`, {
        features: featureArray,
      });

      // DEBUG: Verify if Flask is sending a new unique number or the same 0.638
      console.log(
        "Raw Response from ML Model:",
        mlRes.data.sustainability_score,
      );

      const score = mlRes.data.sustainability_score;

      // 3. Update UI States
      setPrediction(score);
      setLatestAuditData({ score, features: featureArray });

      // 4. Save to Node.js/MongoDB (Port 5000)
      // const dbRes = await axios.post(
      //   "http://localhost:5000/api/auth/audit",
      //   { score, features: featureArray },
      //   { headers: { "x-auth-token": token } },
      // );
      const dbRes = await axios.post(
        `${BACKEND_URL}/api/auth/audit`,
        { score, features: featureArray },
        { headers: { "x-auth-token": token } },
      );

      console.log("✅ Audit successfully saved to MongoDB:", dbRes.data);
    } catch (err) {
      // Detailed error logging to distinguish between Flask and Node failures
      console.error("Critical Audit Failure:");
      console.error("Message:", err.message);
      if (err.response) console.error("Server Response:", err.response.data);

      alert(
        "Intelligence Service Error. Check if your Flask (5001) and Node (5000) servers are running.",
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = () => {
    const input = certificateRef.current;
    // Scale 2 improves image quality for the PDF
    html2canvas(input, { backgroundColor: "#0f172a", scale: 2 }).then(
      (canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        // Centered position on A4 page
        pdf.addImage(imgData, "PNG", 15, 20, 180, 130);
        pdf.save(`SustainIQ_Report_${Date.now()}.pdf`);
      },
    );
  };

  const badge = prediction !== null ? getBadge(prediction) : null;

  return (
    <div className="min-h-screen bg-slate-900 pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10">
        {/* Left: Input Form */}
        <div className="lg:col-span-5 bg-white/5 border border-white/10 p-8 rounded-3xl h-fit shadow-2xl">
          <h2 className="text-3xl font-black text-white mb-6">
            Start <span className="text-green-500">Audit</span>
          </h2>
          <form onSubmit={handlePredict} className="grid grid-cols-2 gap-4">
            {labels.map((label, i) => (
              <div key={i}>
                <label className="text-[9px] uppercase font-bold text-gray-500 mb-1 block tracking-wider">
                  {label}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white focus:border-green-500 outline-none transition-all placeholder-slate-600"
                  value={features[i]}
                  onChange={(e) => {
                    const newFeat = [...features];
                    newFeat[i] = e.target.value;
                    setFeatures(newFeat);
                  }}
                />
              </div>
            ))}
            <button
              disabled={loading}
              className={`col-span-2 py-4 rounded-xl font-bold mt-4 transition-all shadow-lg ${
                loading
                  ? "bg-gray-700 cursor-wait"
                  : "bg-green-600 hover:bg-green-500 shadow-green-900/20 active:scale-95"
              }`}
            >
              {loading ? "Analyzing AI Metrics..." : "Run Intelligence Report"}
            </button>
          </form>
        </div>

        {/* Right: Results & Analytics */}
        <div className="lg:col-span-7 space-y-8">
          {prediction !== null ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Certificate Capture Area */}
              <div
                ref={certificateRef}
                className={`p-12 border-2 rounded-[2rem] bg-slate-900 text-center relative overflow-hidden ${badge.border} ${badge.shadow}`}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-30"></div>
                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] mb-4">
                  Official ESG Intelligence Report
                </p>
                <h3 className={`text-7xl font-black mb-2 ${badge.color}`}>
                  {badge.label}
                </h3>
                <h4 className="text-8xl font-black text-white italic tracking-tighter">
                  {(prediction * 100).toFixed(1)}
                  <span className="text-3xl opacity-50">%</span>
                </h4>
                <p className="text-gray-400 mt-6 text-sm max-w-sm mx-auto leading-relaxed">
                  This property has been audited against 11 sustainability
                  parameters using specialized Machine Learning models.
                </p>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={downloadCertificate}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-bold border border-white/10 transition-all active:bg-white/20"
                >
                  Download PDF Report
                </button>
                <button
                  onClick={() => {
                    setPrediction(null);
                    setFeatures(Array(11).fill(""));
                  }}
                  className="px-8 bg-slate-800 text-gray-400 rounded-2xl hover:text-white transition-all border border-transparent hover:border-slate-600"
                >
                  Reset
                </button>
              </div>
            </div>
          ) : (
            <div className="h-[350px] flex flex-col items-center justify-center bg-white/5 border-2 border-dashed border-white/10 rounded-[2rem] text-gray-500">
              <div className="w-16 h-16 mb-4 border-2 border-dashed border-gray-700 rounded-full flex items-center justify-center animate-spin-slow">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <p className="text-lg font-medium text-gray-400">
                Awaiting Parameter Input
              </p>
              <p className="text-xs mt-2 text-gray-600">
                Intelligence scores will appear here after analysis.
              </p>
            </div>
          )}

          {/* Analytics Radar Chart */}
          <Analytics latestAudit={latestAuditData} />
        </div>
      </div>
    </div>
  );
}
