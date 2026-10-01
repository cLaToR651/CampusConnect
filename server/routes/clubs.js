const express = require("express");
const Club = require("../models/Club");
const ClubMessage = require("../models/ClubMessage");
const { requireUserId, requireRoles } = require("../middleware/requestUser");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const clubs = await Club.find()
            .populate("created_by", "name")
            .sort({ is_recruiting: -1, name: 1 })
            .lean();
            
        const rows = clubs.map(c => ({
            ...c,
            id: c._id,
            creator_name: c.created_by?.name,
            member_count: c.members?.length || 0
        }));
        res.json(rows);
    } catch (error) { res.status(500).json({ message: "Failed to fetch clubs" }); }
});

async function requireClubMember(req, res, next) {
    const club = await Club.findOne({ _id: req.params.id, "members.user": req.userId });
    if (!club) return res.status(403).json({ message: "Join this club to access its chat" });
    next();
}

router.post("/", requireUserId, requireRoles("admin", "club_coordinator"), async (req, res) => {
    const { name, description, category, logo_url, contact_email, instagram_url, is_recruiting } = req.body;
    if (!name || !description) return res.status(400).json({ message: "Club name and description are required" });
    try {
        const newClub = new Club({
            name, description, category: category || null, logo_url: logo_url || null, 
            contact_email: contact_email || null, instagram_url: instagram_url || null, 
            is_recruiting: Boolean(is_recruiting), created_by: req.userId,
            members: []
        });
        await newClub.save();
        res.status(201).json({ message: "Club created", id: newClub._id });
    } catch (error) { 
        if (error.code === 11000) return res.status(409).json({ message: "A club with this name already exists" }); 
        res.status(500).json({ message: "Failed to create club" }); 
    }
});

router.put("/:id", requireUserId, requireRoles("admin", "club_coordinator"), async (req, res) => {
    const { name, description, category, is_recruiting } = req.body;
    if (!name || !description) return res.status(400).json({ message: "Club name and description are required" });
    try {
        const updatedClub = await Club.findByIdAndUpdate(req.params.id, {
            name, description, category: category || null, is_recruiting: Boolean(is_recruiting)
        });
        if (!updatedClub) return res.status(404).json({ message: "Club not found" });
        res.json({ message: "Club updated" });
    } catch (error) { 
        if (error.code === 11000) return res.status(409).json({ message: "A club with this name already exists" }); 
        res.status(500).json({ message: "Failed to update club" }); 
    }
});

router.post("/:id/join", requireUserId, async (req, res) => {
    try {
        const club = await Club.findById(req.params.id);
        if (!club) return res.status(404).json({ message: "Club not found" });

        const existingMember = club.members.find(m => m.user.toString() === req.userId);
        if (existingMember) return res.status(409).json({ message: "Already a club member" });

        club.members.push({ user: req.userId, role: 'member' });
        await club.save();
        res.status(201).json({ message: "Joined club successfully" });
    } catch (error) { res.status(500).json({ message: "Unable to join club" }); }
});

router.get("/:id/membership", requireUserId, async (req, res) => {
    try {
        const club = await Club.findOne({ _id: req.params.id, "members.user": req.userId });
        res.json({ joined: Boolean(club) });
    } catch (error) { res.status(500).json({ message: "Unable to check club membership" }); }
});

router.get("/:id/messages", requireUserId, requireClubMember, async (req, res) => {
    try {
        const messages = await ClubMessage.find({ club: req.params.id })
            .populate("user", "name")
            .sort({ createdAt: 1 })
            .lean();
            
        const rows = messages.map(m => ({
            id: m._id, message: m.message, created_at: m.createdAt, user_id: m.user?._id, author_name: m.user?.name
        }));
        res.json(rows);
    } catch (error) { res.status(500).json({ message: "Failed to fetch club messages" }); }
});

router.post("/:id/messages", requireUserId, requireClubMember, async (req, res) => {
    const message = typeof req.body.message === "string" ? req.body.message.trim() : "";
    if (!message) return res.status(400).json({ message: "Message cannot be empty" });
    try {
        const newMessage = new ClubMessage({
            club: req.params.id,
            user: req.userId,
            message
        });
        await newMessage.save();
        res.status(201).json({ id: newMessage._id, message: "Message sent" });
    } catch (error) { res.status(500).json({ message: "Failed to send message" }); }
});

router.delete("/:id", requireUserId, requireRoles("admin", "club_coordinator"), async (req, res) => {
    try {
        const deletedClub = await Club.findByIdAndDelete(req.params.id);
        if (!deletedClub) return res.status(404).json({ message: "Club not found" });
        res.json({ message: "Club removed" });
    } catch (error) { console.error(error); res.status(500).json({ message: "Failed to remove club" }); }
});

module.exports = router;
