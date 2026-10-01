const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Resource = require("../models/Resource");
const { requireUserId, requireRoles } = require("../middleware/requestUser");
const router = express.Router();

const upload = multer({
    dest: path.join(__dirname, "../uploads"),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.get("/", async (req, res) => {
    const { departmentId, programId, semesterId, type } = req.query;
    const filter = { status: 'approved' };
    if (departmentId) filter.department = departmentId;
    if (programId) filter.program = programId;
    if (semesterId) filter.semester = semesterId;
    if (type) filter.resource_type = type;

    try {
        const resources = await Resource.find(filter)
            .populate("department", "name")
            .populate("program", "name")
            .populate("semester", "semester_number")
            .populate("uploaded_by", "name")
            .sort({ createdAt: -1 })
            .lean();

        const rows = resources.map(r => ({
            ...r,
            id: r._id,
            department_name: r.department?.name,
            program_name: r.program?.name,
            semester_number: r.semester?.semester_number,
            uploader_name: r.uploaded_by?.name
        }));
        res.json(rows);
    } catch (error) { res.status(500).json({ message: "Failed to fetch resources" }); }
});

router.post("/", requireUserId, upload.single("file"), async (req, res) => {
    const { title, description, resource_type, department_id, program_id, semester_id, subject_name } = req.body;
    if (!title || !resource_type || !department_id || !req.file) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "Title, type, department, and file are required" });
    }
    
    try {
        const newResource = new Resource({
            title, description: description || null, resource_type,
            file_url: `/uploads/${req.file.filename}`, file_name: req.file.originalname, file_size_bytes: req.file.size,
            department: department_id, program: program_id || null, semester: semester_id || null,
            subject_name: subject_name || null, uploaded_by: req.userId,
            status: ['admin', 'club_coordinator'].includes(req.user.role) ? 'approved' : 'pending'
        });
        await newResource.save();
        res.status(201).json({ message: "Resource uploaded", id: newResource._id });
    } catch (error) { 
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: "Failed to upload resource" }); 
    }
});

router.get("/pending", requireUserId, requireRoles("admin"), async (req, res) => {
    try {
        const resources = await Resource.find({ status: 'pending' })
            .populate("department", "name")
            .populate("uploaded_by", "name")
            .sort({ createdAt: 1 })
            .lean();
        const rows = resources.map(r => ({
            ...r, id: r._id, department_name: r.department?.name, uploader_name: r.uploaded_by?.name
        }));
        res.json(rows);
    } catch (error) { res.status(500).json({ message: "Failed to fetch pending resources" }); }
});

router.patch("/:id/approve", requireUserId, requireRoles("admin"), async (req, res) => {
    try {
        const updatedRes = await Resource.findByIdAndUpdate(req.params.id, { status: 'approved' });
        if (!updatedRes) return res.status(404).json({ message: "Resource not found" });
        res.json({ message: "Resource approved" });
    } catch (error) { res.status(500).json({ message: "Failed to approve resource" }); }
});

router.delete("/:id", requireUserId, requireRoles("admin"), async (req, res) => {
    try {
        const resource = await Resource.findByIdAndDelete(req.params.id);
        if (!resource) return res.status(404).json({ message: "Resource not found" });
        const filePath = path.join(__dirname, "..", resource.file_url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.json({ message: "Resource deleted" });
    } catch (error) { res.status(500).json({ message: "Failed to delete resource" }); }
});

module.exports = router;
