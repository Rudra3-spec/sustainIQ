import React, { useState, useRef, useContext } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { AuthContext } from "../context/AuthContext";
import Analytics from "./Analytics.jsx";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const ML_URL = import.meta.env.VITE_ML_URL || "http://localhost:5001";

// All features are 0–1, exactly matching the ML training dataset.
// Labels show what 0 and 1 represent so the user understands the scale.
const FEATURES = [
  {
    key: "building_density",
    label: "Building Density",
    hint: "0 = sparse / rural  ·  1 = extremely dense urban",
    icon: "🏢",
  },
  {
    key: "road_connectivity",
    label: "Road Connectivity",
    hint: "0 = poor road network  ·  1 = excellent connectivity",
    icon: "🛣️",
  },
  {
    key: "public_transit_access",
    label: "Public Transit Access",
    hint: "0 = no transit  ·  1 = extensive transit network",
    icon: "🚇",
  },
  {
    key: "air_quality",
    label: "Air Quality",
    hint: "0 = heavily polluted  ·  1 = clean / pristine air",
    icon: "💨",
  },
  {
    key: "green_cover_percentage",
    label: "Green Cover",
    hint: "0 = no greenery  ·  1 = fully green area",
    icon: "🌿",
  },
  {
    key: "carbon_footprint",
    label: "Carbon Footprint Score",
    hint: "0 = very high emissions  ·  1 = near-zero emissions",
    icon: "♻️",
  },
  {
    key: "population_density",
    label: "Population Density",
    hint: "0 = very sparse  ·  1 = maximum urban density",
    icon: "👥",
  },
  {
    key: "crime_rate",
    label: "Safety Score",
    hint: "0 = very unsafe / high crime  ·  1 = very safe",
    icon: "🛡️",
  },
  {
    key: "avg_income",
    label: "Average Income Level",
    hint: "0 = very low income  ·  1 = very high income",
    icon: "💰",
  },
  {
    key: "renewable_energy",
    label: "Renewable Energy Usage",
    hint: "0 = fully fossil-fuel dependent  ·  1 = 100% renewable",
    icon: "⚡",
  },
  {
    key: "disaster_risk",
    label: "Disaster Resilience",
    hint: "0 = extremely high risk  ·  1 = fully resilient",
    icon: "🏔️",
  },
];

const DEFAULT_VALUES = Object.fromEntries(FEATURES.map((f) => [f.key, ""]));

// Geo API maps these keys from its response
const GEO_MAP = {
  building_density: "building_density",
  road_connectivity: "road_connectivity",
  public_transit_access: "public_transit_access",
  air_quality: "air_quality_index",
  green_cover_percentage: "green_cover_percentage",
  population_density: "population_density",
  disaster_risk: "disaster_risk_index",
};

export default function Audit() {
  const [values, setValues] = useState({ ...DEFAULT_VALUES });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [latestAuditData, setLatestAuditData] = useState(null);
  const certificateRef = useRef(null);

  const getBadge = (score) => {
    if (score >= 0.8)
      return { label: "GOLD", color: "#f59e0b", glow: "0 0 40px rgba(245,158,11,0.4)", tier: "Platinum Sustainability" };
    if (score >= 0.6)
      return { label: "SILVER", color: "#94a3b8", glow: "0 0 40px rgba(148,163,184,0.4)", tier: "High Sustainability" };
    if (score >= 0.4)
      return { label: "BRONZE", color: "#f97316", glow: "0 0 40px rgba(249,115,22,0.4)", tier: "Moderate Sustainability" };
    return { label: "NEEDS WORK", color: "#ef4444", glow: "0 0 40px rgba(239,68,68,0.4)", tier: "Low Sustainability" };
  };

  const handleSliderChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  // Auto-fill: geo API already returns 0–1 values. Map directly.
  const handleAutoFetch = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const token = localStorage.getItem("token");
          const res = await axios.post(
            `${BACKEND_URL}/api/geo/fetch-attributes`,
            { lat: latitude, lng: longitude },
            { headers: { "x-auth-token": token } }
          );
          const d = res.data;
          // Directly map 0–1 geo values — no conversion needed
          setValues((prev) => ({
            ...prev,
            building_density: parseFloat(d.building_density).toFixed(2),
            road_connectivity: parseFloat(d.road_connectivity).toFixed(2),
            public_transit_access: parseFloat(d.public_transit_access).toFixed(2),
            air_quality: parseFloat(d.air_quality_index).toFixed(2),
            green_cover_percentage: parseFloat(d.green_cover_percentage).toFixed(2),
            population_density: parseFloat(d.population_density).toFixed(2),
            disaster_risk: parseFloat(d.disaster_risk_index).toFixed(2),
          }));
        } catch (err) {
          console.error("Geo fetch error:", err);
          alert("Could not fetch location data. Check if the backend is running.");
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        console.error("Geolocation denied:", err);
        alert("Location access denied. Please allow location permissions.");
        setGeoLoading(false);
      }
    );
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Build feature array in the exact order the ML model was trained on
    // All values are already 0–1, clip to [0,1] for safety
    const featureArray = FEATURES.map((f) => {
      const v = parseFloat(values[f.key]);
      return isNaN(v) ? 0 : Math.min(1, Math.max(0, parseFloat(v.toFixed(4))));
    });

    console.log("=== Audit Submission ===");
    console.log("Features (0–1):", FEATURES.map((f, i) => `${f.key}=${featureArray[i]}`));

    const token = localStorage.getItem("token");
    try {
      // 1. Get ML prediction
      const mlRes = await axios.post(`${ML_URL}/predict`, { features: featureArray });
      const score = mlRes.data.sustainability_score;
      console.log("ML Score:", score);

      setPrediction(score);
      setLatestAuditData({ score, features: featureArray });

      // 2. Save to MongoDB
      await axios.post(
        `${BACKEND_URL}/api/auth/audit`,
        { score, features: featureArray },
        { headers: { "x-auth-token": token } }
      );
      console.log("✅ Saved to MongoDB");
    } catch (err) {
      console.error("Audit failed:", err.message);
      if (err.response) console.error("Response:", err.response.data);
      alert("Intelligence Engine Error. Ensure all 3 servers are running (Node :5000, Flask :5001, Vite :5173).");
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = () => {
    html2canvas(certificateRef.current, { backgroundColor: "#0f172a", scale: 2 }).then((canvas) => {
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 15, 20, 180, 130);
      pdf.save(`SustainIQ_Report_${Date.now()}.pdf`);
    });
  };

  const badge = prediction !== null ? getBadge(prediction) : null;
  const allFilled = FEATURES.every((f) => values[f.key] !== "" && values[f.key] !== undefined);

  return (
    <div style={{ minHeight: "100vh", background: "#080f1a", paddingTop: "88px", paddingBottom: "60px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px" }}>

        {/* Page Header */}
        <div style={{ marginBottom: "36px" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900, color: "#fff", margin: 0 }}>
            AI <span style={{ color: "#22c55e" }}>Sustainability Audit</span>
          </h1>
          <p style={{ color: "#64748b", marginTop: "8px", fontSize: "0.95rem" }}>
            All parameters are on a <strong style={{ color: "#94a3b8" }}>0–1 normalised scale</strong>, matching the ML training dataset exactly.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px", alignItems: "start" }}>

          {/* ─── LEFT: INPUT FORM ─── */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "28px" }}>

            {/* Auto-Fill Button */}
            <button
              type="button"
              onClick={handleAutoFetch}
              disabled={geoLoading}
              style={{
                width: "100%", padding: "14px", borderRadius: "14px", border: "1px solid rgba(59,130,246,0.4)",
                background: geoLoading ? "rgba(30,41,59,0.8)" : "rgba(59,130,246,0.12)",
                color: "#60a5fa", fontWeight: 700, fontSize: "0.9rem", cursor: geoLoading ? "wait" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                marginBottom: "24px", transition: "all 0.2s", letterSpacing: "0.02em"
              }}
            >
              {geoLoading ? (
                <>
                  <span style={{ width: "16px", height: "16px", border: "2px solid #60a5fa", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                  Fetching Location Data...
                </>
              ) : (
                <>📍 Auto-Fill Via Current Location</>
              )}
            </button>

            {/* Info box */}
            <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: "12px", padding: "14px 18px", marginBottom: "24px" }}>
              <p style={{ color: "#86efac", fontSize: "0.82rem", margin: 0, fontWeight: 600 }}>
                📊 All inputs are on a <strong>0.0 → 1.0</strong> scale
              </p>
              <p style={{ color: "#4ade80", fontSize: "0.75rem", margin: "6px 0 0", opacity: 0.7 }}>
                This matches the model's training data distribution exactly. Enter decimal values between 0 and 1.
              </p>
            </div>

            <form onSubmit={handlePredict}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                {FEATURES.map((f) => {
                  const val = parseFloat(values[f.key]);
                  const pct = isNaN(val) ? 0 : val * 100;
                  return (
                    <div key={f.key} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                        <span style={{ fontSize: "1rem" }}>{f.icon}</span>
                        <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                          {f.label}
                        </label>
                      </div>

                      {/* Value display */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.01"
                          required
                          value={values[f.key]}
                          onChange={(e) => handleSliderChange(f.key, e.target.value)}
                          style={{
                            width: "72px", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "8px", padding: "6px 10px", color: "#fff", fontSize: "0.9rem", fontWeight: 700,
                            outline: "none", textAlign: "center"
                          }}
                          placeholder="0.00"
                        />
                        <span style={{
                          fontSize: "0.75rem", fontWeight: 600, padding: "3px 10px", borderRadius: "20px",
                          background: `rgba(34,197,94,${isNaN(val) ? 0.05 : 0.1 + val * 0.2})`,
                          color: isNaN(val) ? "#475569" : `hsl(${120 * val}, 70%, 60%)`
                        }}>
                          {isNaN(val) ? "—" : `${pct.toFixed(0)}%`}
                        </span>
                      </div>

                      {/* Slider */}
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isNaN(val) ? 0 : val}
                        onChange={(e) => handleSliderChange(f.key, e.target.value)}
                        style={{ width: "100%", accentColor: "#22c55e", cursor: "pointer", marginBottom: "6px" }}
                      />

                      <p style={{ fontSize: "0.65rem", color: "#334155", margin: 0, lineHeight: 1.4 }}>{f.hint}</p>
                    </div>
                  );
                })}
              </div>

              <button
                type="submit"
                disabled={loading || !allFilled}
                style={{
                  width: "100%", padding: "16px", borderRadius: "14px", border: "none",
                  background: loading || !allFilled
                    ? "rgba(51,65,85,0.8)"
                    : "linear-gradient(135deg, #16a34a, #22c55e)",
                  color: "#fff", fontWeight: 800, fontSize: "1rem", cursor: loading || !allFilled ? "not-allowed" : "pointer",
                  boxShadow: loading || !allFilled ? "none" : "0 8px 32px rgba(34,197,94,0.3)",
                  transition: "all 0.3s", letterSpacing: "0.03em"
                }}
              >
                {loading ? "⏳ Running Intelligence Engine..." : "🧠 Run AI Sustainability Audit"}
              </button>
            </form>
          </div>

          {/* ─── RIGHT: RESULTS ─── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {prediction !== null ? (
              <>
                {/* Certificate */}
                <div
                  ref={certificateRef}
                  style={{
                    background: "linear-gradient(135deg, #0f172a 0%, #0d1f12 100%)",
                    border: `2px solid ${badge.color}44`,
                    borderRadius: "28px", padding: "48px 36px", textAlign: "center",
                    position: "relative", overflow: "hidden",
                    boxShadow: badge.glow,
                  }}
                >
                  {/* Top shimmer */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, ${badge.color}, transparent)` }} />

                  <p style={{ color: "#475569", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "16px" }}>
                    Official ESG Intelligence Report
                  </p>

                  <div style={{ fontSize: "5rem", fontWeight: 900, color: badge.color, marginBottom: "4px", textShadow: badge.glow }}>
                    {badge.label}
                  </div>

                  <div style={{ fontSize: "6rem", fontWeight: 900, color: "#fff", lineHeight: 1, marginBottom: "8px" }}>
                    {(prediction * 100).toFixed(1)}
                    <span style={{ fontSize: "2rem", opacity: 0.4 }}>%</span>
                  </div>

                  <p style={{ color: badge.color, fontWeight: 700, fontSize: "0.9rem", marginBottom: "16px", opacity: 0.8 }}>
                    {badge.tier}
                  </p>

                  {/* Score bar */}
                  <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "100px", height: "8px", margin: "0 auto 16px", maxWidth: "280px", overflow: "hidden" }}>
                    <div style={{
                      width: `${prediction * 100}%`, height: "100%", borderRadius: "100px",
                      background: `linear-gradient(90deg, ${badge.color}88, ${badge.color})`,
                      transition: "width 1s ease"
                    }} />
                  </div>

                  <p style={{ color: "#64748b", fontSize: "0.8rem", maxWidth: "300px", margin: "0 auto", lineHeight: 1.6 }}>
                    Audited across 11 sustainability parameters using a trained Random Forest model.
                  </p>
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={downloadCertificate}
                    style={{
                      flex: 1, padding: "14px", borderRadius: "14px",
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem",
                      transition: "all 0.2s"
                    }}
                  >
                    📄 Download PDF Report
                  </button>
                  <button
                    onClick={() => { setPrediction(null); setValues({ ...DEFAULT_VALUES }); setLatestAuditData(null); }}
                    style={{
                      padding: "14px 24px", borderRadius: "14px",
                      background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.08)",
                      color: "#94a3b8", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem"
                    }}
                  >
                    Reset
                  </button>
                </div>
              </>
            ) : (
              <div style={{
                minHeight: "320px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,0.02)", border: "2px dashed rgba(255,255,255,0.06)", borderRadius: "28px"
              }}>
                <div style={{
                  width: "64px", height: "64px", borderRadius: "50%",
                  border: "2px dashed rgba(100,116,139,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "16px", animation: "slowspin 8s linear infinite"
                }}>
                  <div style={{ width: "8px", height: "8px", background: "#22c55e", borderRadius: "50%" }} />
                </div>
                <p style={{ color: "#475569", fontSize: "1rem", fontWeight: 600, margin: 0 }}>Awaiting Parameter Input</p>
                <p style={{ color: "#334155", fontSize: "0.8rem", marginTop: "8px" }}>Fill all 11 fields and run the audit</p>
              </div>
            )}

            {/* Analytics chart */}
            <Analytics latestAudit={latestAuditData} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slowspin { to { transform: rotate(360deg); } }
        input[type=range] { -webkit-appearance: none; height: 4px; border-radius: 4px; background: rgba(255,255,255,0.08); }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #22c55e; cursor: pointer; box-shadow: 0 0 8px rgba(34,197,94,0.5); }
        input[type=number]::-webkit-inner-spin-button { opacity: 0; }
        input[type=number]:hover::-webkit-inner-spin-button { opacity: 1; }
      `}</style>
    </div>
  );
}
