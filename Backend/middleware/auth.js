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
        } else {
          const user = storage.getUser(decoded.id);
          if (user) {
            req.user = user;
            return next();
          }
        }
      } catch (err) {
        // Token expired/invalid - fallback to guest
      }
    }

    // Guest / Fallback user
    if (storage.isMongoConnected()) {
      let defaultUser = await User.findOne();
      if (!defaultUser) {
        defaultUser = await User.create({ name: "Kaveri" });
      }
      req.user = defaultUser;
    } else {
      req.user = storage.getUser();
    }
    next();
  } catch (error) {
    // If any DB error occurs, fallback to local storage
    req.user = storage.getUser();
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
