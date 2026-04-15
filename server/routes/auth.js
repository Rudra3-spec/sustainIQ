const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const User = require("../models/User");

// @route    POST api/auth/signup
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    user = new User({ name, email, password, audits: [] }); // Initialize audits array

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "72h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      },
    );
  } catch (err) {
    console.error("Signup Error:", err.message);
    res.status(500).send("Server Error");
  }
});

// @route    POST api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "72h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      },
    );
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/auth/user
router.get("/user", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error("User Fetch Error:", err.message);
    res.status(500).send("Server Error");
  }
});

// @route    POST api/auth/audit (FIXED FOR 500 ERROR)
router.post("/audit", auth, async (req, res) => {
  try {
    const { score, features } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ msg: "User not found" });

    // FIX: If audits is undefined, initialize it as an array
    if (!user.audits) {
      user.audits = [];
    }

    const newAudit = {
      score: score,
      features: features,
      date: new Date(),
    };

    // Now unshift will never fail
    user.audits.unshift(newAudit);

    await user.save();
    res.json(user.audits);
  } catch (err) {
    console.error("Error saving audit:", err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/auth/profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error("Profile Error:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
