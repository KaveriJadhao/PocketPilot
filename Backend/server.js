const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Global Exception Handlers for 100% Uptime
process.on("uncaughtException", (err) => {
  console.error("⚠️ Uncaught Exception caught safely:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("⚠️ Unhandled Rejection at:", promise, "reason:", reason);
});

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const userRoutes = require("./routes/userRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

/* MIDDLEWARE */
app.use(cors());
app.use(express.json());

/* SERVE FRONTEND STATIC FILES */
const frontendPath = path.join(__dirname, "../Frontend");
app.use(express.static(frontendPath));

/* ROOT ROUTE -> REDIRECT TO HOME PAGE */
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "html", "index.html"));
});

/* HEALTH CHECK */
app.get("/test", (req, res) => {
  res.json({
    status: "online",
    service: "PocketPilot API Server",
    version: "2.0.0",
    frontend: `http://localhost:${PORT}/html/index.html`,
    dashboard: `http://localhost:${PORT}/html/dashboard.html`,
    timestamp: new Date().toISOString(),
  });
});

/* API ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/user", userRoutes);
app.use("/api/ai", aiRoutes);

/* 404 HANDLER FOR API */
app.use("/api", (req, res) => {
  res.status(404).json({ message: `API route ${req.originalUrl} not found` });
});

/* GLOBAL ERROR HANDLER */
app.use((err, req, res, next) => {
  console.error("Global Server Error:", err);
  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});

/* START SERVER FIRST THEN CONNECT DATABASE */
const server = app.listen(PORT, () => {
  console.log(`\n🚀 PocketPilot Server Running on http://localhost:${PORT}`);
  console.log(`🌐 Landing Page: http://localhost:${PORT}/html/index.html`);
  console.log(`🧭 Dashboard:    http://localhost:${PORT}/html/dashboard.html\n`);
  
  // Asynchronous database connection
  connectDB();
});

// Process keep-alive timer
setInterval(() => {}, 1000 * 60 * 60);