const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const aiRoutes = require("./routes/aiRoutes");

const expenseRoutes = require("./routes/expenseRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/expenses", expenseRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/user", userRoutes);
mongoose.connect(process.env.MONGO_URI)
.then(() => {

    console.log("MongoDB Connected");

    app.listen(5000, () => {
        console.log("Server Running on Port 5000");
    });

})
.catch((error) => {

    console.log(error);

});