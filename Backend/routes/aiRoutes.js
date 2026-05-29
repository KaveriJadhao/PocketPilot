const express = require("express");
const Expense = require("../models/Expense");
const groq = require("../config/groq");

const router = express.Router();

router.get("/insights", async (req, res) => {

    try {

        const expenses = await Expense.find();

        if(expenses.length === 0){

            return res.json({
                insight:
                "Add your first expense to receive personalized AI insights."
            });

        }

        const expenseText = expenses.map(exp =>

            `${exp.title} | ₹${exp.amount} | ${exp.category} | ${exp.mood}`

        ).join("\n");

        const completion =
    await groq.chat.completions.create({

        model: "llama-3.3-70b-versatile",

        messages: [
            {
                role: "system",
                content:
                `You are a friendly financial coach for Indian college students.

Return exactly 3 insights.

Format:

📊 Spending: <one short sentence>

😊 Mood: <one short sentence>

💡 Tip: <one short sentence>

Keep each line under 15 words.`
            },

            {
                role: "user",
                content:
                `Analyze these expenses:

${expenseText}`
            }
        ],

        temperature: 0.7

    });
        const insight =
            completion.choices[0].message.content;

        res.json({ insight });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            insight: "AI service unavailable."
        });

    }

});

module.exports = router;