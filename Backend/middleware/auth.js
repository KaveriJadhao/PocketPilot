const jwt = require("jsonwebtoken");
const User = require("../models/User");
const storage = require("../services/storage");

const JWT_SECRET = process.env.JWT_SECRET || "pocketpilot_jwt_secret_key_2026";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (storage.isMongoConnected()) {
          const user = await User.findById(decoded.id).select("-password");
          if (user) {
            req.user = user;
            return next();
          }
        }
        
        let user = storage.getUser(decoded.id);
        if (!user && decoded.name) {
          user = {
            _id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            monthlyBudget: decoded.monthlyBudget || 15000,
            savingsGoal: decoded.savingsGoal || 5000,
            streak: decoded.streak || 1,
            gems: decoded.gems || 0,
            level: decoded.level || 1,
          };
        }
        if (user) {
          req.user = user;
          return next();
        }
      } catch (err) {
        // Token expired/invalid
      }
    }

    req.user = null;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (storage.isMongoConnected()) {
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      req.user = user;
    } else {
      const user = storage.getUser(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      req.user = user;
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { authMiddleware, requireAuth, JWT_SECRET };
