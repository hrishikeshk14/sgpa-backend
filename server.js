// 1️⃣ Imports
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// 🔐 ADD THESE HERE
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

const User = require("./models/User");

const Record = require("./models/Record");
const auth = require("./middleware/auth");


// 2️⃣ App setup
const app = express();
app.use(cors({
    origin: [
        "https://sgpa-frontend.onrender.com",
        "http://localhost:5500",   // for local testing
        "http://127.0.0.1:5500"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.options("*", cors());

app.use(express.json());

// 3️⃣ DB connection
mongoose.connect(process.env.MONGO_URI)

    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error(err));

// 4️⃣ ROUTES START HERE  ✅

// Test route
app.get("/", (req, res) => {
    res.send("SGPA Backend Running");
});

// 🔐 AUTH ROUTES — ADD YOUR CODE HERE
app.post("/api/register", async (req, res) => {
    try {
        const existing = await User.findOne({ studentId: req.body.studentId });
        if (existing) {
            return res.status(400).json({
                error: "User already exists. Please login."
            });
        }

        const hashed = await bcrypt.hash(req.body.password, 10);
        await User.create({
            studentId: req.body.studentId,
            password: hashed,
            role: "student"
        });

        res.json({ message: "Registered successfully" });
    } catch (err) {
        res.status(500).json({ error: "Registration failed" });
    }
});


app.post("/api/login", async (req, res) => {
    console.log("LOGIN BODY:", req.body);

    const user = await User.findOne({ studentId: req.body.studentId });
    console.log("USER FOUND:", user);

    if (!user) return res.status(401).json({ error: "Invalid login" });

    const ok = await bcrypt.compare(req.body.password, user.password);
    console.log("PASSWORD MATCH:", ok);

    if (!ok) return res.status(401).json({ error: "Invalid login" });

    const token = jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" }
);


    res.json({ token });
});

// SGPA routes

app.post("/api/sgpa", auth, async (req, res) => {
    const record = new Record({
        ...req.body,
        studentId: req.user.id   // link record to logged-in user
    });
    await record.save();
    res.json({ message: "SGPA saved" });
});


app.get("/api/sgpa", auth, async (req, res) => {
    const records = await Record.find({ studentId: req.user.id });
    res.json(records);
});

app.get("/api/admin/records", auth, async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user.role !== "admin") {
        return res.status(403).json({ error: "Access denied" });
    }

    const records = await Record.find();
    res.json(records);
});

// 5️⃣ SERVER STARTS LAST
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

