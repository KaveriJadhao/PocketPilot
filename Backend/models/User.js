const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        default: "Kaveri"
    },

    streak: {
        type: Number,
        default: 1
    },

    gems: {
        type: Number,
        default: 0
    },

    level: {
        type: Number,
        default: 1
    },

    lastActiveDate: {
        type: String
    }

});

module.exports = mongoose.model("User", userSchema);