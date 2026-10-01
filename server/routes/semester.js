const express = require("express");
const router = express.Router();
const Semester = require("../models/Semester");

// Get all semesters
router.get("/", async (req, res) => {
    try {
        const semesters = await Semester.find()
            .populate("program", "name code")
            .sort({ "program.name": 1, semester_number: 1 })
            .lean();

        const rows = semesters.map(s => ({
            id: s._id,
            semester_number: s.semester_number,
            program_id: s.program?._id,
            program_name: s.program?.name,
            program_code: s.program?.code
        }));

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch semesters"
        });
    }
});

// Get semesters for a specific program
router.get("/program/:programId", async (req, res) => {
    try {
        const { programId } = req.params;

        const semesters = await Semester.find({ program: programId })
            .sort({ semester_number: 1 })
            .lean();

        res.json(semesters.map(s => ({ ...s, id: s._id, program_id: s.program })));
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch program semesters"
        });
    }
});

// Add a semester
router.post("/", async (req, res) => {
    try {
        const { program_id, semester_number } = req.body;

        if (!program_id || !semester_number) {
            return res.status(400).json({
                message: "Program and semester number are required"
            });
        }

        const newSemester = new Semester({
            program: program_id,
            semester_number
        });

        await newSemester.save();

        res.status(201).json({
            message: "Semester created successfully",
            id: newSemester._id
        });

    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "This semester already exists for the program"
            });
        }

        res.status(500).json({
            message: "Failed to create semester"
        });
    }
});

module.exports = router;