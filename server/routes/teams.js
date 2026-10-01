const express = require("express");
const Team = require("../models/Team");
const { requireUserId } = require("../middleware/requestUser");
const router = express.Router();

router.get("/", async (req, res) => {
    const { eventId } = req.query;
    if (!eventId) return res.status(400).json({ message: "eventId is required" });
    try {
        const teams = await Team.find({ event: eventId, is_open: true })
            .populate("created_by", "name")
            .sort({ createdAt: -1 })
            .lean();

        const rows = teams.map(t => ({
            ...t,
            id: t._id,
            creator_name: t.created_by?.name,
            member_count: t.members?.filter(m => m.status === 'accepted').length || 0
        }));
        res.json(rows);
    } catch (error) { res.status(500).json({ message: "Failed to fetch teams" }); }
});

router.post("/", requireUserId, async (req, res) => {
    const { event_id, name, description, required_skills } = req.body;
    if (!event_id || !name) return res.status(400).json({ message: "Event and team name are required" });
    try {
        const newTeam = new Team({
            event: event_id,
            name,
            description: description || null,
            required_skills: required_skills || [],
            created_by: req.userId,
            members: [{ user: req.userId, role: 'leader', status: 'accepted' }]
        });
        await newTeam.save();
        res.status(201).json({ message: "Team created", id: newTeam._id });
    } catch (error) { 
        if (error.code === 11000) return res.status(409).json({ message: "This team name is already used for the event" }); 
        res.status(500).json({ message: "Failed to create team" }); 
    }
});

router.post("/:id/join", requireUserId, async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) return res.status(404).json({ message: "Team not found" });

        const existingMember = team.members.find(m => m.user.toString() === req.userId);
        if (existingMember) return res.status(409).json({ message: "You already have a request for this team" });

        team.members.push({ user: req.userId, status: 'pending' });
        await team.save();

        res.status(201).json({ message: "Team join request sent" });
    } catch (error) { 
        res.status(500).json({ message: "Unable to request team membership" }); 
    }
});

module.exports = router;
