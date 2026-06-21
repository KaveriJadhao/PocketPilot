const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const expenseRoutes = require("./routes/expenseRoutes");
const userRoutes = require("./routes/userRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

/* MIDDLEWARE */
app.use(cors());
app.use(express.json());

/* TEST ROUTE */
app.get("/test", (req, res) => {
    res.send("Correct PocketPilot backend is running");
});

/* ROUTES */
app.use("/api/expenses", expenseRoutes);
console.log("Expense route loaded");

app.use("/api/user", userRoutes);
app.use("/api/ai", aiRoutes);

/* DATABASE */
mongoose.connect(process.env.MONGO_URI)
.then(() => {

    console.log("MongoDB Connected");

    app.listen(5000, () => {
        console.log("Server Running on Port 5000");
    });

})
.catch((error) => {
    console.log("MongoDB Error:", error);
});