const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Expense = require("../models/Expense");
const storage = require("../services/storage");
const { authMiddleware } = require("../middleware/auth");

router.use(authMiddleware);

// GET USER
router.get("/", async (req, res) => {
  try {
    if (storage.isMongoConnected()) {
      let user = req.user;
      if (!user) {
        user = await User.findOne();
      }
      if (!user) {
        user = await User.create({ name: "Kaveri" });
      }
      return res.json(user);
    }
    const user = storage.getUser(req.user ? req.user._id : null);
    res.json(user);
  } catch (error) {
    const user = storage.getUser(req.user ? req.user._id : null);
    res.json(user);
  }
});

// GET USER PROFILE ALIAS
router.get("/profile", async (req, res) => {
  try {
    if (storage.isMongoConnected()) {
      let user = req.user;
      if (!user) user = await User.findOne();
      if (!user) user = await User.create({ name: "Kaveri" });
      return res.json(user);
    }
    const user = storage.getUser(req.user ? req.user._id : null);
    res.json(user);
  } catch (error) {
    const user = storage.getUser(req.user ? req.user._id : null);
    res.json(user);
  }
});

// CREATE / ENSURE USER
router.get("/create", async (req, res) => {
  try {
    if (storage.isMongoConnected()) {
      let user = await User.findOne();
      if (!user) {
        user = new User({ name: "Kaveri" });
        await user.save();
      }
      return res.json(user);
    }
    const user = storage.getUser();
    res.json(user);
  } catch (error) {
    const user = storage.getUser();
    res.json(user);
  }
});

// UPDATE USER PROFILE & SETTINGS
router.put("/profile", async (req, res) => {
  try {
    const { name, monthlyBudget, savingsGoal, theme } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (monthlyBudget !== undefined) updateData.monthlyBudget = Number(monthlyBudget);
    if (savingsGoal !== undefined) updateData.savingsGoal = Number(savingsGoal);
    if (theme !== undefined) updateData.theme = theme;

    if (storage.isMongoConnected()) {
      let user = req.user;
      if (!user) user = await User.findOne();
      if (user) {
        Object.assign(user, updateData);
        await user.save();
        return res.json({ message: "Profile updated successfully", user });
      }
    }

    const user = storage.updateUser(req.user ? req.user._id : null, updateData);
    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    const user = storage.updateUser(req.user ? req.user._id : null, req.body);
    res.json({ message: "Profile updated successfully", user });
  }
});

// RESET ALL USER DATA
router.delete("/reset", async (req, res) => {
  try {
    if (storage.isMongoConnected()) {
      await Expense.deleteMany({});
      let user = req.user || (await User.findOne());
      if (user) {
        user.streak = 1;
        user.gems = 0;
        user.level = 1;
        user.lastActiveDate = "";
        await user.save();
      }
      return res.json({ message: "All data reset successfully" });
    }

    storage.deleteAllExpenses();
    const user = storage.updateUser(req.user ? req.user._id : null, {
      streak: 1,
      gems: 0,
      level: 1,
      lastActiveDate: "",
    });
    res.json({ message: "All data reset successfully" });
  } catch (error) {
    storage.deleteAllExpenses();
    res.json({ message: "All data reset successfully" });
  }
});

module.exports = router;