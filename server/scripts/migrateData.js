const mongoose = require("mongoose");
const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Department = require("../models/Department");
const Program = require("../models/Program");
const Semester = require("../models/Semester");
const User = require("../models/User");
const Club = require("../models/Club");
const Event = require("../models/Event");
const Team = require("../models/Team");
const ExperiencePost = require("../models/ExperiencePost");
const PostComment = require("../models/PostComment");
const Resource = require("../models/Resource");
const FriendRequest = require("../models/FriendRequest");
const GlobalMessage = require("../models/GlobalMessage");
const DirectMessage = require("../models/DirectMessage");
const ClubMessage = require("../models/ClubMessage");

async function migrateData() {
    console.log("Starting data migration from MySQL to MongoDB...");
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
    });
    console.log("Connected to MySQL.");

    const departmentMap = {};
    const programMap = {};
    const semesterMap = {};
    const userMap = {};
    const clubMap = {};
    const eventMap = {};
    const teamMap = {};
    const postMap = {};

    try {
        console.log("Clearing existing MongoDB collections...");
        await User.deleteMany({});
        await Semester.deleteMany({});
        await Program.deleteMany({});
        await Department.deleteMany({});
        await Club.deleteMany({});
        await Event.deleteMany({});
        await Team.deleteMany({});
        await ExperiencePost.deleteMany({});
        await PostComment.deleteMany({});
        await Resource.deleteMany({});
        await FriendRequest.deleteMany({});
        await GlobalMessage.deleteMany({});
        await DirectMessage.deleteMany({});
        await ClubMessage.deleteMany({});

        console.log("Migrating departments...");
        const [departments] = await pool.query("SELECT * FROM departments");
        for (const dept of departments) {
            const deptDoc = { name: dept.name, description: dept.description };
            if (dept.username) deptDoc.username = dept.username;
            if (dept.code) deptDoc.code = dept.code;
            const newDept = new Department(deptDoc);
            await newDept.save();
            departmentMap[dept.id] = newDept._id;
        }

        console.log("Migrating programs...");
        const [programs] = await pool.query("SELECT * FROM programs");
        for (const prog of programs) {
            const newProg = new Program({ name: prog.name, code: prog.code, duration_years: prog.duration_years, department: departmentMap[prog.department_id] });
            await newProg.save();
            programMap[prog.id] = newProg._id;
        }

        console.log("Migrating semesters...");
        const [semesters] = await pool.query("SELECT * FROM semesters");
        for (const sem of semesters) {
            const newSem = new Semester({ semester_number: sem.semester_number, program: programMap[sem.program_id] });
            await newSem.save();
            semesterMap[sem.id] = newSem._id;
        }

        console.log("Migrating users...");
        const [users] = await pool.query("SELECT * FROM users");
        for (const u of users) {
            const [badges] = await pool.query("SELECT badge FROM user_badges WHERE user_id = ?", [u.id]);
            let skillsArray = [];
            try { if (u.skills) skillsArray = JSON.parse(u.skills); } catch (e) { skillsArray = []; }

            const userDoc = {
                name: u.name, email: u.email, password_hash: u.password_hash, role: u.role,
                department: u.department_id ? departmentMap[u.department_id] : null,
                program: u.program_id ? programMap[u.program_id] : null,
                semester: u.semester_id ? semesterMap[u.semester_id] : null,
                academic_year: u.academic_year, bio: u.bio, skills: skillsArray,
                badges: badges.map(b => b.badge), is_active: u.is_active
            };
            if (u.username) userDoc.username = u.username;
            const newUser = new User(userDoc);
            await newUser.save();
            userMap[u.id] = newUser._id;
        }

        console.log("Migrating clubs...");
        const [clubs] = await pool.query("SELECT * FROM clubs");
        for (const c of clubs) {
            const [members] = await pool.query("SELECT user_id, role, joined_at FROM club_memberships WHERE club_id = ?", [c.id]);
            const memberDocs = members.map(m => ({ user: userMap[m.user_id], role: m.role, joinedAt: m.joined_at }));
            const newClub = new Club({
                name: c.name, description: c.description, logo_url: c.logo_url, created_by: userMap[c.created_by], members: memberDocs
            });
            await newClub.save();
            clubMap[c.id] = newClub._id;
        }

        console.log("Migrating events...");
        const [events] = await pool.query("SELECT * FROM events");
        for (const e of events) {
            const [regs] = await pool.query("SELECT user_id, status, created_at FROM event_registrations WHERE event_id = ?", [e.id]);
            const regDocs = regs.map(r => ({ user: userMap[r.user_id], status: r.status, registered_at: r.created_at }));
            const newEvent = new Event({
                title: e.title, description: e.description, event_type: e.event_type,
                venue: e.venue, club: e.club_id ? clubMap[e.club_id] : null,
                organizer: userMap[e.organizer_id], starts_at: e.starts_at, ends_at: e.ends_at,
                registration_url: e.registration_url, registration_deadline: e.registration_deadline,
                requires_team: e.requires_team, min_team_size: e.min_team_size, max_team_size: e.max_team_size,
                status: e.status, registrations: regDocs,
                department: e.department_id ? departmentMap[e.department_id] : null
            });
            await newEvent.save();
            eventMap[e.id] = newEvent._id;
        }

        console.log("Migrating teams...");
        const [teams] = await pool.query("SELECT * FROM teams");
        for (const t of teams) {
            const [members] = await pool.query("SELECT user_id, role, status, joined_at FROM team_members WHERE team_id = ?", [t.id]);
            const memDocs = members.map(m => ({ user: userMap[m.user_id], role: m.role, status: m.status, joined_at: m.joined_at }));
            const newTeam = new Team({
                name: t.name, event: t.event_id ? eventMap[t.event_id] : null,
                description: t.description, created_by: userMap[t.created_by], members: memDocs,
                required_skills: (t.required_skills ? JSON.parse(t.required_skills) : []),
                is_open: t.is_open
            });
            await newTeam.save();
            teamMap[t.id] = newTeam._id;
        }

        console.log("Migrating experience posts...");
        const [posts] = await pool.query("SELECT * FROM experience_posts");
        for (const p of posts) {
            let tagsArray = [];
            try { if (p.tags) tagsArray = JSON.parse(p.tags); } catch (e) { tagsArray = []; }
            const newPost = new ExperiencePost({
                author: userMap[p.author_id], event: p.event_id ? eventMap[p.event_id] : null,
                title: p.title, content: p.content, tags: tagsArray, is_published: p.is_published
            });
            await newPost.save();
            postMap[p.id] = newPost._id;
        }

        console.log("Migrating post comments...");
        const [comments] = await pool.query("SELECT * FROM post_comments");
        for (const c of comments) {
            await new PostComment({ post: postMap[c.post_id], author: userMap[c.author_id], content: c.content }).save();
        }

        console.log("Migrating resources...");
        const [resources] = await pool.query("SELECT * FROM resources");
        for (const r of resources) {
            await new Resource({
                title: r.title, description: r.description, resource_type: r.resource_type,
                file_url: r.file_url, file_name: r.file_name, file_size_bytes: r.file_size_bytes,
                department: r.department_id ? departmentMap[r.department_id] : null,
                program: r.program_id ? programMap[r.program_id] : null,
                semester: r.semester_id ? semesterMap[r.semester_id] : null,
                subject_name: r.subject_name, uploaded_by: userMap[r.uploaded_by], status: r.status
            }).save();
        }

        console.log("Migrating social interactions...");
        const [friendReqs] = await pool.query("SELECT * FROM friend_requests");
        for (const f of friendReqs) {
            await new FriendRequest({ sender: userMap[f.sender_id], receiver: userMap[f.receiver_id], status: f.status }).save();
        }
        
        const [globalMsgs] = await pool.query("SELECT * FROM global_messages");
        for (const g of globalMsgs) {
            await new GlobalMessage({ user: userMap[g.user_id], message: g.message }).save();
        }

        const [directMsgs] = await pool.query("SELECT * FROM direct_messages");
        for (const d of directMsgs) {
            await new DirectMessage({ sender: userMap[d.sender_id], receiver: userMap[d.receiver_id], message: d.message }).save();
        }

        const [clubMsgs] = await pool.query("SELECT * FROM club_messages");
        for (const cm of clubMsgs) {
            await new ClubMessage({ club: clubMap[cm.club_id], sender: userMap[cm.sender_id], message: cm.message }).save();
        }

        console.log("Migration completed successfully!");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await mongoose.disconnect();
        await pool.end();
        process.exit(0);
    }
}

migrateData();
