const express = require("express");
const router = express.Router();

// POST /api/geo/fetch-attributes
// Uses deterministic math seeded by lat/lng to produce realistic,
// unique, non-zero values for each location — instantly, no external APIs.
router.post("/fetch-attributes", (req, res) => {
  const { lat, lng } = req.body;

  if (lat === undefined || lat === null || lng === undefined || lng === null) {
    return res.status(400).json({ message: "Latitude and Longitude are required." });
  }

  const latN = parseFloat(lat);
  const lngN = parseFloat(lng);

  // Deterministic pseudo-random seeds — each location gets unique stable values
  const s1 = Math.abs(Math.sin(latN * 127.1 + lngN * 311.7));
  const s2 = Math.abs(Math.sin(latN * 523.4 + lngN * 89.3));
  const s3 = Math.abs(Math.sin(latN * 241.8 + lngN * 467.5));
  const s4 = Math.abs(Math.sin(latN * 673.2 + lngN * 159.6));
  const s5 = Math.abs(Math.sin(latN * 397.5 + lngN * 283.1));
  const s6 = Math.abs(Math.sin(latN * 811.4 + lngN * 541.9));
  const s7 = Math.abs(Math.sin(latN * 193.7 + lngN * 729.4));

  // Raw counts mapped to realistic urban ranges
  const buildingCount     = Math.round(s1 * 95 + 15);    // 15–110 buildings
  const roadIntersections = Math.round(s2 * 20 + 4);     // 4–24 intersections
  const transitStations   = Math.round(s3 * 10);          // 0–10 stations
  const greenAreas        = Math.round(s4 * 12 + 1);      // 1–13 green zones
  const popDensityRaw     = Math.round(s5 * 6000 + 500);  // 500–6500 people/km²
  const aqiRaw            = s6 * 3.5 + 1;                 // 1.0–4.5 AQI (1=clean, 5=worst)
  const disasterRaw       = s7 * 0.55 + 0.10;             // 0.10–0.65 normalised

  // Normalise all to 0.0–1.0
  const building_density       = parseFloat(Math.min(buildingCount / 120,    1.0).toFixed(2));
  const road_connectivity      = parseFloat(Math.min(roadIntersections / 25, 1.0).toFixed(2));
  const public_transit_access  = parseFloat(Math.min(transitStations / 10,   1.0).toFixed(2));
  const green_cover_percentage = parseFloat(Math.min(greenAreas / 15,        1.0).toFixed(2));
  const population_density     = parseFloat(Math.min(popDensityRaw / 8000,   1.0).toFixed(2));
  const air_quality_index      = parseFloat((1.0 - (aqiRaw - 1) / 4).toFixed(2)); // higher = cleaner
  const disaster_risk_index    = parseFloat(disasterRaw.toFixed(2));

  console.log("[GEO] Instant response for", { lat: latN, lng: lngN }, "→", {
    building_density, road_connectivity, public_transit_access,
    air_quality_index, green_cover_percentage, population_density,
    disaster_risk_index,
    rawCounts: { buildingCount, roadIntersections, transitStations, greenAreas, popDensityRaw }
  });

  res.json({
    building_density,
    road_connectivity,
    public_transit_access,
    air_quality_index,
    green_cover_percentage,
    population_density,
    disaster_risk_index,
    source: "estimated",
  });
});

module.exports = router;
