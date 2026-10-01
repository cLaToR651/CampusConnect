const express = require("express");
const router = express.Router();
const Program = require("../models/Program");

// Get all programs
router.get("/", async (req, res) => {
    try {
        const programs = await Program.find()
            .populate("department", "name")
            .sort({ name: 1 })
            .lean();

        // Map to match old response structure if necessary
        const rows = programs.map(p => ({
            id: p._id,
            name: p.name,
            code: p.code,
            duration_years: p.duration_years,
            department_id: p.department?._id,
            department_name: p.department?.name
        }));

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch programs"
        });
    }
});

// Get programs belonging to a department
router.get("/department/:departmentId", async (req, res) => {
    try {
        const { departmentId } = req.params;

        const programs = await Program.find({ department: departmentId })
            .sort({ name: 1 })
            .lean();

        res.json(programs.map(p => ({ ...p, id: p._id, department_id: p.department })));
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch department programs"
        });
    }
});

// Add a program
router.post("/", async (req, res) => {
    try {
        const {
            department_id,
            name,
            code,
            duration_years
        } = req.body;

        if (!department_id || !name) {
            return res.status(400).json({
                message: "Department and program name are required"
            });
        }

        const newProgram = new Program({
            department: department_id,
            name,
            code: code || null,
            duration_years: duration_years || null
        });

        await newProgram.save();

        res.status(201).json({
            message: "Program created successfully",
            id: newProgram._id
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create program"
        });
    }
});

module.exports = router;