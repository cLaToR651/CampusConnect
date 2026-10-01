const express = require("express");
const router = express.Router();
const Department = require("../models/Department");

// Get all departments
router.get("/", async (req, res) => {
    try {
        const departments = await Department.find().sort({ name: 1 });
        res.json(departments);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch departments"
        });
    }
});

// Add a department
router.post("/", async (req, res) => {
    try {
        const { name, code, description } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Department name is required"
            });
        }

        const newDepartment = new Department({
            name,
            code: code || null,
            description: description || null
        });

        await newDepartment.save();

        res.status(201).json({
            message: "Department created successfully",
            id: newDepartment._id
        });
    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Department already exists"
            });
        }

        res.status(500).json({
            message: "Failed to create department"
        });
    }
});

module.exports = router;