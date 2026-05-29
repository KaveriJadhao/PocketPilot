const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Expense = require("../models/Expense");
// CREATE USER
router.get("/create", async (req, res) => {

    try {

        const user = new User();

        await user.save();

        res.json(user);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

// GET USER
router.get("/", async (req, res) => {

    try {

        const user = await User.findOne();

        res.json(user);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

module.exports = router;
router.delete("/reset", async (req, res) => {
    try {
        await Expense.deleteMany();

        let user = await User.findOne();

        if(user){
            user.streak = 1;
            user.gems = 0;
            user.level = 1;
            user.lastActiveDate = "";
            await user.save();
        }

        res.json({
            message: "All data reset successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});