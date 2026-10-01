const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { requireUserId } = require("../middleware/requestUser");

const router = express.Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const campusEmailDomain = "@mitwpu.edu.in";

function publicUser(user) {
    return { id: user._id, name: user.name, username: user.username, email: user.email, role: user.role,
        department_id: user.department, program_id: user.program, semester_id: user.semester,
        academic_year: user.academic_year, bio: user.bio, skills: user.skills, badges: user.badges || [] };
}

function issueToken(userId) {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");
    return jwt.sign({}, process.env.JWT_SECRET, { subject: String(userId), expiresIn: "7d" });
}

router.post("/register", async (req, res) => {
    const { name, email, password, department_id, program_id, semester_id } = req.body;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const hasCampusEmail = normalizedEmail.endsWith(campusEmailDomain)
        && normalizedEmail.length > campusEmailDomain.length;
    if (!name?.trim() || !emailPattern.test(normalizedEmail) || !hasCampusEmail || typeof password !== "string" || password.length < 8) {
        return res.status(400).json({ message: "Use your MIT-WPU email address ending in @mitwpu.edu.in, along with your name and a password of at least 8 characters" });
    }
    try {
        const passwordHash = await bcrypt.hash(password, 12);
        
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) return res.status(409).json({ message: "An account with this email already exists" });

        const newUser = new User({
            name: name.trim(),
            email: normalizedEmail,
            password_hash: passwordHash,
            department: department_id || null,
            program: program_id || null,
            semester: semester_id || null,
            badges: []
        });
        await newUser.save();

        res.status(201).json({ token: issueToken(newUser._id), user: publicUser(newUser) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Unable to create account" });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (typeof email !== "string" || typeof password !== "string") return res.status(400).json({ message: "Email and password are required" });
    try {
        const user = await User.findOne({ email: email.trim().toLowerCase(), is_active: true });
        if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ message: "Invalid email or password" });
        
        res.json({ token: issueToken(user._id), user: publicUser(user) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Unable to log in" });
    }
});

router.get("/me", requireUserId, async (req, res) => {
    const user = await User.findById(req.userId);
    res.json({ user: publicUser(user) });
});

router.patch("/profile", requireUserId, async (req, res) => {
    const { name, username, bio, skills, academic_year, department_id, badges } = req.body;
    if (!name?.trim() || !/^[a-zA-Z0-9_.-]{3,50}$/.test(username || "")) return res.status(400).json({ message: "Provide your name and a valid username" });
    try {
        const updateData = {
            name: name.trim(),
            username: username.trim(),
            bio: bio?.trim() || null,
            skills: Array.isArray(skills) ? skills : [],
            academic_year: ["1st", "2nd", "3rd", "4th"].includes(academic_year) ? academic_year : null,
            department: department_id || null
        };

        if (Array.isArray(badges)) {
            updateData.badges = [...new Set(badges.map((item) => String(item).trim()).filter(Boolean).slice(0, 12))];
        }

        const updatedUser = await User.findByIdAndUpdate(req.userId, updateData, { new: true });
        res.json({ message: "Profile updated", user: publicUser(updatedUser) });
    } catch (error) { 
        if (error.code === 11000) return res.status(409).json({ message: "Username is already taken" }); 
        res.status(500).json({ message: "Unable to update profile" }); 
    }
});

module.exports = router;
