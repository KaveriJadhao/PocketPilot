const express = require("express");
const router = express.Router();

const Expense = require("../models/Expense");
const User = require("../models/User");

/* GET ALL EXPENSES */
router.get("/", async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ createdAt: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/* ADD EXPENSE */
router.post("/", async (req, res) => {
    try {
        const newExpense = new Expense({
            title: req.body.title,
            amount: req.body.amount,
            category: req.body.category,
            mood: req.body.mood
        });

        const savedExpense = await newExpense.save();

        const user = await User.findOne();

        if (user) {
            /* GEMS SYSTEM */
            if (newExpense.amount <= 100) {
                user.gems += 5;
            } else if (newExpense.amount <= 500) {
                user.gems += 3;
            } else {
                user.gems += 1;
            }

            /* STREAK SYSTEM */
            const today = new Date().toDateString();

            if (!user.lastActiveDate) {
                user.streak = 1;
            } else {
                const lastDate = new Date(user.lastActiveDate);
                const currentDate = new Date(today);

                const diffTime = currentDate - lastDate;
                const diffDays = diffTime / (1000 * 60 * 60 * 24);

                if (diffDays === 1) {
                    user.streak += 1;
                } else if (diffDays > 1) {
                    user.streak = 1;
                }
            }

            user.lastActiveDate = today;

            /* LEVEL SYSTEM */
            user.level = Math.floor(user.gems / 50) + 1;

            await user.save();
        }

        res.status(201).json(savedExpense);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;