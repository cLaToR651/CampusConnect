const express = require("express");
const User = require("../models/User");
const FriendRequest = require("../models/FriendRequest");
const GlobalMessage = require("../models/GlobalMessage");
const DirectMessage = require("../models/DirectMessage");
const { requireUserId } = require("../middleware/requestUser");

const router = express.Router();

router.get("/users", requireUserId, async (req, res) => {
    const searchRegex = new RegExp(String(req.query.search || "").trim(), 'i');
    try {
        const users = await User.find({
            is_active: true,
            _id: { $ne: req.userId },
            $or: [{ name: searchRegex }, { username: searchRegex }] // Not checking department name via lookup for simplicity here
        }).populate("department", "name").limit(100).lean();

        const friendRequests = await FriendRequest.find({
            $or: [
                { sender: req.userId, receiver: { $in: users.map(u => u._id) } },
                { receiver: req.userId, sender: { $in: users.map(u => u._id) } }
            ]
        }).lean();

        const reqMap = {};
        friendRequests.forEach(fr => {
            const otherId = fr.sender.toString() === req.userId ? fr.receiver.toString() : fr.sender.toString();
            reqMap[otherId] = fr.status;
        });

        const rows = users.map(u => ({
            ...u,
            id: u._id,
            department_name: u.department?.name,
            badges: u.badges || [],
            skills: u.skills || [],
            friendship_status: reqMap[u._id.toString()] || null
        }));
        res.json(rows);
    } catch (error) { console.error(error); res.status(500).json({ message: "Failed to find students" }); }
});

router.get("/friends", requireUserId, async (req, res) => {
    try {
        const acceptedRequests = await FriendRequest.find({
            status: 'accepted',
            $or: [{ sender: req.userId }, { receiver: req.userId }]
        }).lean();

        const friendIds = acceptedRequests.map(fr => 
            fr.sender.toString() === req.userId ? fr.receiver : fr.sender
        );

        const users = await User.find({ _id: { $in: friendIds }, is_active: true })
            .populate("department", "name").lean();

        const rows = users.map(u => ({
            ...u,
            id: u._id,
            department_name: u.department?.name,
            badges: u.badges || []
        }));
        res.json(rows);
    } catch (error) { res.status(500).json({ message: "Failed to fetch friends" }); }
});

router.get("/friend-requests", requireUserId, async (req, res) => {
    try {
        const requests = await FriendRequest.find({ receiver: req.userId, status: 'pending' })
            .populate("sender", "name username")
            .sort({ createdAt: -1 })
            .lean();
        const rows = requests.map(r => ({
            id: r._id,
            sender_id: r.sender?._id,
            sender_name: r.sender?.name,
            username: r.sender?.username,
            status: r.status,
            created_at: r.createdAt
        }));
        res.json(rows);
    } catch (error) { res.status(500).json({ message: "Failed to fetch friend requests" }); }
});

router.post("/friend-requests/:userId", requireUserId, async (req, res) => {
    if (req.params.userId === req.userId) return res.status(400).json({ message: "You cannot add yourself" });
    try {
        const existing = await FriendRequest.findOne({ sender: req.userId, receiver: req.params.userId });
        if (existing) return res.status(409).json({ message: "Friend request already exists" });

        const reqDoc = new FriendRequest({ sender: req.userId, receiver: req.params.userId });
        await reqDoc.save();
        res.status(201).json({ message: "Friend request sent" });
    } catch (error) { res.status(500).json({ message: "Unable to send friend request" }); }
});

router.patch("/friend-requests/:id", requireUserId, async (req, res) => {
    const status = req.body.status === "accepted" ? "accepted" : "declined";
    try {
        const updatedReq = await FriendRequest.findOneAndUpdate(
            { _id: req.params.id, receiver: req.userId, status: 'pending' },
            { status },
            { new: true }
        );
        if (!updatedReq) return res.status(404).json({ message: "Friend request not found" });
        res.json({ message: status === "accepted" ? "Friend request accepted" : "Friend request declined" });
    } catch (error) { res.status(500).json({ message: "Unable to update friend request" }); }
});

router.get("/global-messages", requireUserId, async (req, res) => {
    try { 
        const messages = await GlobalMessage.find()
            .populate("user", "name")
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();
        const rows = messages.map(m => ({
            id: m._id, message: m.message, created_at: m.createdAt, user_id: m.user?._id, author_name: m.user?.name
        })).reverse();
        res.json(rows);
    } catch (error) { res.status(500).json({ message: "Failed to fetch global chat" }); }
});

router.post("/global-messages", requireUserId, async (req, res) => {
    const message = typeof req.body.message === "string" ? req.body.message.trim() : "";
    if (!message) return res.status(400).json({ message: "Message cannot be empty" });
    try { 
        const newMsg = new GlobalMessage({ user: req.userId, message });
        await newMsg.save();
        res.status(201).json({ id: newMsg._id, message: "Message sent" });
    } catch (error) { res.status(500).json({ message: "Failed to send global message" }); }
});

router.get("/messages/:userId", requireUserId, async (req, res) => {
    try { 
        const messages = await DirectMessage.find({
            $or: [
                { sender: req.userId, receiver: req.params.userId },
                { sender: req.params.userId, receiver: req.userId }
            ]
        })
        .populate("sender", "name")
        .sort({ createdAt: 1 })
        .lean();

        const rows = messages.map(m => ({
            id: m._id, message: m.message, created_at: m.createdAt, sender_id: m.sender?._id, sender_name: m.sender?.name
        }));
        res.json(rows);
    } catch (error) { res.status(500).json({ message: "Failed to fetch conversation" }); }
});

router.post("/messages/:userId", requireUserId, async (req, res) => {
    const message = typeof req.body.message === "string" ? req.body.message.trim() : "";
    if (!message || req.params.userId === req.userId) return res.status(400).json({ message: "A valid recipient and message are required" });
    try { 
        const newMsg = new DirectMessage({ sender: req.userId, receiver: req.params.userId, message });
        await newMsg.save();
        res.status(201).json({ id: newMsg._id, message: "Message sent" });
    } catch (error) { res.status(500).json({ message: "Failed to send direct message" }); }
});

router.get("/notifications", requireUserId, async (req, res) => {
    try {
        const Resource = require("../models/Resource");
        const Event = require("../models/Event");

        // 1. Pending friend requests received by user
        const friendRequests = await FriendRequest.find({ receiver: req.userId, status: 'pending' })
            .populate("sender", "name")
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        // 2. Recent direct messages received by user
        const recentMessages = await DirectMessage.find({ receiver: req.userId })
            .populate("sender", "name")
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        // 3. Newly uploaded resources (last 7 days or top 4)
        const recentResources = await Resource.find({ status: 'approved' })
            .populate("uploaded_by", "name")
            .sort({ createdAt: -1 })
            .limit(4)
            .lean();

        // 4. Upcoming / newly published events
        const recentEvents = await Event.find({ status: 'published', starts_at: { $gte: new Date(Date.now() - 24 * 3600 * 1000) } })
            .sort({ starts_at: 1 })
            .limit(4)
            .lean();

        const notifs = [];

        friendRequests.forEach(fr => {
            notifs.push({
                id: `fr-${fr._id}`,
                title: `${fr.sender?.name || "A student"} sent you a friend request`,
                time: fr.createdAt,
                type: "friend",
                link: "/community",
                unread: true
            });
        });

        recentMessages.forEach(dm => {
            notifs.push({
                id: `dm-${dm._id}`,
                title: `New message from ${dm.sender?.name || "Student"}: "${dm.message.slice(0, 28)}${dm.message.length > 28 ? '...' : ''}"`,
                time: dm.createdAt,
                type: "message",
                link: "/community",
                unread: true
            });
        });

        recentResources.forEach(resItem => {
            notifs.push({
                id: `res-${resItem._id}`,
                title: `New ${resItem.resource_type}: ${resItem.title}`,
                time: resItem.createdAt,
                type: "resource",
                link: "/academics",
                unread: false
            });
        });

        recentEvents.forEach(ev => {
            notifs.push({
                id: `ev-${ev._id}`,
                title: `Upcoming ${ev.event_type}: ${ev.title}`,
                time: ev.createdAt || ev.starts_at,
                type: "event",
                link: "/events",
                unread: false
            });
        });

        // Sort by newest time
        notifs.sort((a, b) => new Date(b.time) - new Date(a.time));

        res.json(notifs.slice(0, 10));
    } catch (err) {
        console.error("Notifications error:", err);
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
});

module.exports = router;