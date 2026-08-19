const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: "Kaveri",
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
    },
    monthlyBudget: {
      type: Number,
      default: 15000,
    },
    savingsGoal: {
      type: Number,
      default: 5000,
    },
    streak: {
      type: Number,
      default: 1,
    },
    gems: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    lastActiveDate: {
      type: String,
      default: "",
    },
    theme: {
      type: String,
      default: "light",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);