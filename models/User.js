const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    studentId: { type: String, unique: true },
    password: String,
    role: { type: String, default: "student" } // student | admin
});

module.exports = mongoose.model("User", UserSchema);
