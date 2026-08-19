const express = require("express");
const storageService = require("../services/storage");
const groq = require("../config/groq");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

// Fallback rule-based insight generator
function generateLocalInsights(expenses) {
  if (!expenses || expenses.length === 0) {
    return "📊 Spending: Add your first expense to receive personalized AI insights.\n\n😊 Mood: Track your mood with each expense to unlock emotional spending trends.\n\n💡 Tip: Keep daily streaks going to level up your financial habits!";
  }

  let total = 0;
  const categories = {};
  const moods = {};

  expenses.forEach((e) => {
    total += Number(e.amount || 0);
    categories[e.category] = (categories[e.category] || 0) + Number(e.amount || 0);
    if (e.mood) moods[e.mood] = (moods[e.mood] || 0) + Number(e.amount || 0);
  });

  const topCategory = Object.keys(categories).reduce((a, b) => (categories[a] > categories[b] ? a : b), "General");
  const topMood = Object.keys(moods).length > 0 ? Object.keys(moods).reduce((a, b) => (moods[a] > moods[b] ? a : b)) : "Neutral";

  return `📊 Spending: Your highest spending is on ${topCategory} (₹${categories[topCategory] || 0}).\n\n😊 Mood: You spent the most while feeling "${topMood}".\n\n💡 Tip: Setting a 10% cap on discretionary food & leisure can save you ₹${Math.round(total * 0.1)} this month.`;
}

router.get("/insights", async (req, res) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id) : null;
    let expenses = [];
    try {
      expenses = await storageService.getExpenses(userId);
    } catch (e) {
      expenses = [];
    }

    if (!expenses || expenses.length === 0) {
      return res.json({
        insight: "📊 Spending: No expenses recorded yet.\n\n😊 Mood: Ready to track your first transaction.\n\n💡 Tip: Record your daily expenses to unlock AI insights and earn gems!",
      });
    }

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes("your_groq")) {
      return res.json({ insight: generateLocalInsights(expenses) });
    }

    const expenseText = expenses
      .slice(0, 15)
      .map((exp) => `${exp.title} | ₹${exp.amount} | ${exp.category} | ${exp.mood || "Neutral"}`)
      .join("\n");

    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are a friendly financial coach for Indian college students.
Return exactly 3 insights.
Format:
📊 Spending: <one short sentence>
😊 Mood: <one short sentence>
💡 Tip: <one short sentence>
Keep each line under 15 words. Mention rupee amounts in ₹.`,
          },
          {
            role: "user",
            content: `Analyze these recent student expenses:\n${expenseText}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      const insight = completion.choices[0]?.message?.content;
      if (insight) {
        return res.json({ insight });
      }
      return res.json({ insight: generateLocalInsights(expenses) });
    } catch (groqError) {
      console.warn("Groq API error (falling back to smart local insights):", groqError.message);
      return res.json({ insight: generateLocalInsights(expenses) });
    }
  } catch (error) {
    console.error("AI Route Error:", error);
    res.status(500).json({
      insight: "📊 Spending: Spending analysis in progress.\n😊 Mood: Keep logging your purchases.\n💡 Tip: Review weekly totals to stay under budget.",
    });
  }
});

module.exports = router;