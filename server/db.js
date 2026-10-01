const mongoose = require("mongoose");
require("dotenv").config();

// Register all Mongoose models
require("./models/User");
require("./models/Department");
require("./models/Program");
require("./models/Semester");
require("./models/Club");
require("./models/Event");
require("./models/Team");
require("./models/ExperiencePost");
require("./models/PostComment");
require("./models/Resource");
require("./models/FriendRequest");
require("./models/GlobalMessage");
require("./models/DirectMessage");
require("./models/ClubMessage");

async function connectDB() {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
    }
}

connectDB();

module.exports = mongoose;