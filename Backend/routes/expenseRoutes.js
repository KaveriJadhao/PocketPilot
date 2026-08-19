const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const User = require("../models/User");
const storage = require("../services/storage");
const { authMiddleware } = require("../middleware/auth");

router.use(authMiddleware);

/* GET ALL EXPENSES */
router.get("/", async (req, res) => {
  try {
    if (storage.isMongoConnected()) {
      const query = req.user ? { $or: [{ userId: req.user._id }, { userId: { $exists: false } }] } : {};
      const expenses = await Expense.find(query).sort({ date: -1, createdAt: -1 });
      return res.json(expenses);
    }
    const expenses = storage.getExpenses(req.user ? req.user._id : null);
    res.json(expenses);
  } catch (error) {
    console.warn("Mongo fetch failed, using fallback:", error.message);
    const expenses = storage.getExpenses(req.user ? req.user._id : null);
    res.json(expenses);
  }
});

/* GET SINGLE EXPENSE */
router.get("/:id", async (req, res) => {
  try {
    if (storage.isMongoConnected()) {
      const expense = await Expense.findById(req.params.id);
      if (expense) return res.json(expense);
    }
    const expense = storage.getExpenseById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.json(expense);
  } catch (error) {
    const expense = storage.getExpenseById(req.params.id);
    if (expense) return res.json(expense);
    res.status(404).json({ message: "Expense not found" });
  }
});

/* ADD EXPENSE */
router.post("/", async (req, res) => {
  try {
    const { title, amount, category, mood, date } = req.body;

    if (!title || amount === undefined || isNaN(Number(amount))) {
      return res.status(400).json({ message: "Title and a valid numeric amount are required" });
    }

    if (storage.isMongoConnected()) {
      const newExpense = new Expense({
        userId: req.user ? req.user._id : undefined,
        title: title.trim(),
        amount: Number(amount),
        category: category ? category.trim() : "Other",
        mood: mood ? mood.trim() : "Neutral",
        date: date ? new Date(date) : new Date(),
      });

      const savedExpense = await newExpense.save();

      // Update user gamification
      let user = req.user;
      if (user && typeof user.save === "function") {
        if (newExpense.amount <= 100) {
          user.gems = (user.gems || 0) + 5;
        } else if (newExpense.amount <= 500) {
          user.gems = (user.gems || 0) + 3;
        } else {
          user.gems = (user.gems || 0) + 1;
        }
        user.level = Math.floor((user.gems || 0) / 50) + 1;
        await user.save();
      }

      return res.status(201).json(savedExpense);
    }

    // Local fallback store
    const saved = storage.addExpense({
      title: title.trim(),
      amount: Number(amount),
      category: category ? category.trim() : "Other",
      mood: mood ? mood.trim() : "Neutral",
      date: date || new Date().toISOString().split("T")[0],
      userId: req.user ? req.user._id : undefined,
    });
    res.status(201).json(saved);
  } catch (error) {
    console.warn("Mongo save failed, using fallback:", error.message);
    const saved = storage.addExpense({
      title: (req.body.title || "Expense").trim(),
      amount: Number(req.body.amount || 0),
      category: req.body.category || "Other",
      mood: req.body.mood || "Neutral",
      date: req.body.date || new Date().toISOString().split("T")[0],
      userId: req.user ? req.user._id : undefined,
    });
    res.status(201).json(saved);
  }
});

/* UPDATE EXPENSE */
router.put("/:id", async (req, res) => {
  try {
    const { title, amount, category, mood, date } = req.body;
    const updateData = {};

    if (title !== undefined) updateData.title = title.trim();
    if (amount !== undefined) updateData.amount = Number(amount);
    if (category !== undefined) updateData.category = category.trim();
    if (mood !== undefined) updateData.mood = mood.trim();
    if (date !== undefined) updateData.date = new Date(date);

    if (storage.isMongoConnected()) {
      const updated = await Expense.findByIdAndUpdate(req.params.id, updateData, { new: true });
      if (updated) return res.json(updated);
    }

    const updated = storage.updateExpense(req.params.id, updateData);
    if (!updated) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* DELETE SINGLE EXPENSE */
router.delete("/:id", async (req, res) => {
  try {
    if (storage.isMongoConnected()) {
      const deleted = await Expense.findByIdAndDelete(req.params.id);
      if (deleted) return res.json({ message: "Expense deleted successfully", id: req.params.id });
    }

    const deleted = storage.deleteExpense(req.params.id);
    res.json({ message: "Expense deleted successfully", id: req.params.id });
  } catch (error) {
    storage.deleteExpense(req.params.id);
    res.json({ message: "Expense deleted successfully", id: req.params.id });
  }
});

/* DELETE ALL EXPENSES */
router.delete("/", async (req, res) => {
  try {
    if (storage.isMongoConnected()) {
      const query = req.user ? { $or: [{ userId: req.user._id }, { userId: { $exists: false } }] } : {};
      await Expense.deleteMany(query);
      return res.json({ message: "All expenses deleted successfully" });
    }

    storage.deleteAllExpenses();
    res.json({ message: "All expenses deleted successfully" });
  } catch (error) {
    storage.deleteAllExpenses();
    res.json({ message: "All expenses deleted successfully" });
  }
});

module.exports = router;