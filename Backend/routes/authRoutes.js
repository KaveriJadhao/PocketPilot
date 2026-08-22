const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const storage = require("../services/storage");
const { requireAuth, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

// Generate JWT Helper
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      monthlyBudget: user.monthlyBudget,
      savingsGoal: user.savingsGoal,
      streak: user.streak || 1,
      gems: user.gems || 0,
      level: user.level || 1,
    },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
};

/* POST /api/auth/register */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, monthlyBudget, savingsGoal } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (storage.isMongoConnected()) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }

      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        monthlyBudget: Number(monthlyBudget) || 15000,
        savingsGoal: Number(savingsGoal) || 5000,
      });

      const token = generateToken(user);
      return res.status(201).json({
        message: "Account created successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          monthlyBudget: user.monthlyBudget,
          savingsGoal: user.savingsGoal,
          streak: user.streak,
          gems: user.gems,
          level: user.level,
        },
      });
    }

    // Local storage
    const existing = storage.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const user = storage.createUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      monthlyBudget: Number(monthlyBudget) || 15000,
      savingsGoal: Number(savingsGoal) || 5000,
    });

    const token = generateToken(user);
    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        monthlyBudget: user.monthlyBudget,
        savingsGoal: user.savingsGoal,
        streak: user.streak,
        gems: user.gems,
        level: user.level,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: error.message || "Registration failed" });
  }
});

/* POST /api/auth/login */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    let user = null;
    if (storage.isMongoConnected()) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    } else {
      user = storage.getUserByEmail(email);
    }

    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        monthlyBudget: user.monthlyBudget,
        savingsGoal: user.savingsGoal,
        streak: user.streak,
        gems: user.gems,
        level: user.level,
        theme: user.theme,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: error.message || "Login failed" });
  }
});

/* GET /api/auth/me */
router.get("/me", requireAuth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id || req.user.id,
        name: req.user.name,
        email: req.user.email,
        monthlyBudget: req.user.monthlyBudget,
        savingsGoal: req.user.savingsGoal,
        streak: req.user.streak,
        gems: req.user.gems,
        level: req.user.level,
        theme: req.user.theme,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* POST /api/auth/guest */
router.post("/guest", async (req, res) => {
  try {
    let guest = {
      _id: "guest_" + Date.now(),
      name: "Guest Student",
      monthlyBudget: 15000,
      savingsGoal: 5000,
      streak: 1,
      gems: 0,
      level: 1,
    };

    if (storage.isMongoConnected()) {
      const dbGuest = await User.findOne({ email: { $exists: false } });
      if (dbGuest) {
        guest = dbGuest;
      } else {
        guest = await User.create({
          name: "Guest Student",
          monthlyBudget: 15000,
          savingsGoal: 5000,
        });
      }
    }

    const token = generateToken(guest);

    res.json({
      message: "Guest session ready",
      token,
      user: {
        id: guest._id,
        name: guest.name,
        monthlyBudget: guest.monthlyBudget,
        savingsGoal: guest.savingsGoal,
        streak: guest.streak,
        gems: guest.gems,
        level: guest.level,
        theme: guest.theme,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
