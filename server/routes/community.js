const express = require("express");
const ExperiencePost = require("../models/ExperiencePost");
const PostComment = require("../models/PostComment");
const { requireUserId, requireRoles } = require("../middleware/requestUser");
const router = express.Router();

router.get("/posts", async (req, res) => {
    const { eventId } = req.query;
    const filter = { is_published: true };
    if (eventId) filter.event = eventId;
    try {
        const posts = await ExperiencePost.find(filter)
            .populate("author", "name")
            .populate("event", "title")
            .sort({ createdAt: -1 })
            .lean();

        const postIds = posts.map(p => p._id);
        const commentsCount = await PostComment.aggregate([
            { $match: { post: { $in: postIds } } },
            { $group: { _id: "$post", count: { $sum: 1 } } }
        ]);
        const commentsMap = {};
        commentsCount.forEach(c => { commentsMap[c._id.toString()] = c.count; });

        const rows = posts.map(p => ({
            ...p,
            id: p._id,
            author_name: p.author?.name,
            event_title: p.event?.title,
            comment_count: commentsMap[p._id.toString()] || 0
        }));
        res.json(rows);
    } catch (error) { res.status(500).json({ message: "Failed to fetch community posts" }); }
});

router.post("/posts", requireUserId, requireRoles("admin"), async (req, res) => {
    const { event_id, title, content, tags } = req.body;
    if (!title || !content) return res.status(400).json({ message: "Title and content are required" });
    try {
        const newPost = new ExperiencePost({
            author: req.userId,
            event: event_id || null,
            title,
            content,
            tags: Array.isArray(tags) ? tags : []
        });
        await newPost.save();
        res.status(201).json({ message: "Tip shared successfully", id: newPost._id });
    } catch (error) { res.status(500).json({ message: "Failed to share tip" }); }
});

router.put("/posts/:id", requireUserId, requireRoles("admin"), async (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ message: "Title and content are required" });
    try {
        const updatedPost = await ExperiencePost.findByIdAndUpdate(req.params.id, { title, content });
        if (!updatedPost) return res.status(404).json({ message: "Post not found" });
        res.json({ message: "Post updated" });
    } catch (error) { res.status(500).json({ message: "Failed to update post" }); }
});

router.get("/posts/:id/comments", async (req, res) => {
    try {
        const comments = await PostComment.find({ post: req.params.id })
            .populate("author", "name")
            .sort({ createdAt: 1 })
            .lean();
        const rows = comments.map(c => ({
            ...c, id: c._id, author_name: c.author?.name
        }));
        res.json(rows);
    } catch (error) { res.status(500).json({ message: "Failed to fetch comments" }); }
});

router.post("/posts/:id/comments", requireUserId, async (req, res) => {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Comment content is required" });
    try {
        const newComment = new PostComment({
            post: req.params.id,
            author: req.userId,
            content
        });
        await newComment.save();
        res.status(201).json({ message: "Comment added", id: newComment._id });
    } catch (error) { res.status(500).json({ message: "Failed to add comment" }); }
});

router.delete("/posts/:id", requireUserId, requireRoles("admin"), async (req, res) => {
    try {
        const deletedPost = await ExperiencePost.findByIdAndDelete(req.params.id);
        if (!deletedPost) return res.status(404).json({ message: "Post not found" });
        await PostComment.deleteMany({ post: req.params.id });
        res.json({ message: "Post removed" });
    } catch (error) { console.error(error); res.status(500).json({ message: "Failed to remove post" }); }
});

module.exports = router;
