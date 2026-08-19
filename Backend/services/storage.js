const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const dataDir = path.join(__dirname, "../data");
const dataFile = path.join(dataDir, "db.json");

// Ensure data directory and file exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const defaultState = {
  users: [
    {
      _id: "default_user_1",
      name: "Kaveri",
      email: "student@university.edu",
      monthlyBudget: 15000,
      savingsGoal: 5000,
      streak: 1,
      gems: 25,
      level: 1,
      theme: "light",
      createdAt: new Date().toISOString(),
    },
  ],
  expenses: [],
};

function readDb() {
  try {
    if (!fs.existsSync(dataFile)) {
      fs.writeFileSync(dataFile, JSON.stringify(defaultState, null, 2), "utf8");
      return defaultState;
    }
    const raw = fs.readFileSync(dataFile, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Local storage read error:", err);
    return defaultState;
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Local storage write error:", err);
  }
}

const isMongoConnected = () => mongoose.connection.readyState === 1;

module.exports = {
  isMongoConnected,
  readDb,
  writeDb,

  // User methods
  getUser: (id) => {
    const db = readDb();
    if (id) return db.users.find((u) => u._id === id || u.id === id);
    return db.users[0] || defaultState.users[0];
  },

  getUserByEmail: (email) => {
    const db = readDb();
    return db.users.find((u) => (u.email || "").toLowerCase() === (email || "").toLowerCase());
  },

  createUser: (userData) => {
    const db = readDb();
    const newUser = {
      _id: "user_" + Date.now(),
      name: userData.name || "Student",
      email: userData.email,
      password: userData.password,
      monthlyBudget: Number(userData.monthlyBudget) || 15000,
      savingsGoal: Number(userData.savingsGoal) || 5000,
      streak: 1,
      gems: 0,
      level: 1,
      theme: userData.theme || "light",
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    writeDb(db);
    return newUser;
  },

  updateUser: (id, updateData) => {
    const db = readDb();
    const idx = db.users.findIndex((u) => u._id === id || u.id === id);
    const targetIdx = idx !== -1 ? idx : 0;
    db.users[targetIdx] = { ...db.users[targetIdx], ...updateData };
    writeDb(db);
    return db.users[targetIdx];
  },

  // Expense methods
  getExpenses: (userId) => {
    const db = readDb();
    return (db.expenses || []).sort(
      (a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
    );
  },

  getExpenseById: (id) => {
    const db = readDb();
    return db.expenses.find((e) => e._id === id);
  },

  addExpense: (expenseData) => {
    const db = readDb();
    const newExpense = {
      _id: "exp_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      title: expenseData.title,
      amount: Number(expenseData.amount),
      category: expenseData.category || "Other",
      mood: expenseData.mood || "Neutral",
      date: expenseData.date || new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      userId: expenseData.userId,
    };
    if (!db.expenses) db.expenses = [];
    db.expenses.unshift(newExpense);

    // Gamification updates on the user
    const user = db.users[0] || defaultState.users[0];
    if (newExpense.amount <= 100) {
      user.gems = (user.gems || 0) + 5;
    } else if (newExpense.amount <= 500) {
      user.gems = (user.gems || 0) + 3;
    } else {
      user.gems = (user.gems || 0) + 1;
    }
    user.level = Math.floor((user.gems || 0) / 50) + 1;
    user.streak = (user.streak || 1);

    writeDb(db);
    return newExpense;
  },

  updateExpense: (id, updateData) => {
    const db = readDb();
    const idx = db.expenses.findIndex((e) => e._id === id);
    if (idx === -1) return null;
    db.expenses[idx] = { ...db.expenses[idx], ...updateData };
    writeDb(db);
    return db.expenses[idx];
  },

  deleteExpense: (id) => {
    const db = readDb();
    const initLen = db.expenses.length;
    db.expenses = db.expenses.filter((e) => e._id !== id);
    writeDb(db);
    return db.expenses.length < initLen;
  },

  deleteAllExpenses: () => {
    const db = readDb();
    db.expenses = [];
    writeDb(db);
    return true;
  },
};
