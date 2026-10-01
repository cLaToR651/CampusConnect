const express = require("express");
const Event = require("../models/Event");
const { requireUserId, requireRoles } = require("../middleware/requestUser");

const router = express.Router();

router.get("/", async (req, res) => {
    const { departmentId, clubId, upcoming } = req.query;
    const filter = { status: 'published' };
    
    if (departmentId) filter.department = departmentId;
    if (clubId) filter.club = clubId;
    if (upcoming === "true") {
        filter.$or = [
            { ends_at: { $gte: new Date() } },
            { ends_at: null, starts_at: { $gte: new Date() } }
        ];
    }

    try {
        const events = await Event.find(filter)
            .populate("department", "name")
            .populate("club", "name")
            .populate("organizer", "name")
            .sort({ starts_at: 1 })
            .lean();
            
        const rows = events.map(e => ({
            ...e,
            id: e._id,
            department_name: e.department?.name,
            club_name: e.club?.name,
            organizer_name: e.organizer?.name
        }));
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch events" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const event = await Event.findOne({ _id: req.params.id, status: 'published' }).lean();
        if (!event) return res.status(404).json({ message: "Event not found" });
        res.json({ ...event, id: event._id });
    } catch (error) { res.status(500).json({ message: "Failed to fetch event" }); }
});

router.post("/", requireUserId, requireRoles("admin", "club_coordinator"), async (req, res) => {
    const { title, description, event_type, department_id, club_id, venue, starts_at, ends_at,
        registration_url, registration_deadline, requires_team, min_team_size, max_team_size } = req.body;
    if (!title || !description || !starts_at || (ends_at && new Date(ends_at) <= new Date(starts_at))) return res.status(400).json({ message: "Provide an end time after the start time" });
    try {
        const newEvent = new Event({
            title, description, event_type: event_type || "other", 
            department: department_id || null, 
            club: club_id || null, 
            organizer: req.userId, 
            venue: venue || null, 
            starts_at, 
            ends_at: ends_at || null, 
            registration_url: registration_url || null, 
            registration_deadline: registration_deadline || null, 
            requires_team: Boolean(requires_team), 
            min_team_size: min_team_size || null, 
            max_team_size: max_team_size || null, 
            status: req.user.role === "admin" ? "published" : "draft"
        });
        await newEvent.save();
        res.status(201).json({ message: "Event saved as draft", id: newEvent._id });
    } catch (error) { console.error(error); res.status(500).json({ message: "Failed to create event" }); }
});

router.put("/:id", requireUserId, requireRoles("admin", "club_coordinator"), async (req, res) => {
    const { title, description, event_type, venue, starts_at, ends_at } = req.body;
    if (!title || !description || !starts_at || !ends_at || new Date(ends_at) <= new Date(starts_at)) return res.status(400).json({ message: "Provide an end time after the start time" });
    try {
        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, {
            title, description, event_type: event_type || "other", venue: venue || null, starts_at, ends_at
        });
        if (!updatedEvent) return res.status(404).json({ message: "Event not found" });
        res.json({ message: "Event updated" });
    } catch (error) { console.error(error); res.status(500).json({ message: "Failed to update event" }); }
});

router.post("/:id/register", requireUserId, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });
        
        const existingReg = event.registrations.find(r => r.user.toString() === req.userId);
        if (existingReg) return res.status(409).json({ message: "Already registered" });

        event.registrations.push({ user: req.userId, status: 'registered' });
        await event.save();
        res.status(201).json({ message: "Registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Unable to register for this event" });
    }
});

router.delete("/:id", requireUserId, requireRoles("admin", "club_coordinator"), async (req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        if (!deletedEvent) return res.status(404).json({ message: "Event not found" });
        res.json({ message: "Event removed" });
    } catch (error) { console.error(error); res.status(500).json({ message: "Failed to remove event" }); }
});

module.exports = router;
