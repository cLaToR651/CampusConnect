const db = require("./db");
const express = require("express");
const cors = require("cors");
const path = require("path");
const departmentRoutes = require("./routes/departments");
const programRoutes = require("./routes/programs");
const semesterRoutes = require("./routes/semester");
const resourceRoutes = require("./routes/resources");
const eventRoutes = require("./routes/events");
const clubRoutes = require("./routes/clubs");
const teamRoutes = require("./routes/teams");
const communityRoutes = require("./routes/community");
const authRoutes = require("./routes/auth");
const socialRoutes = require("./routes/social");

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/semesters", semesterRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/social", socialRoutes);
app.get("/", (req, res) => {
    res.json({
        message: "CampusConnect backend is running!"
    });
});

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
