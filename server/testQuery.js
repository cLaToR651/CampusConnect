const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const searchRegex = new RegExp('', 'i');
    const users = await User.find({ is_active: true, $or: [{ name: searchRegex }, { username: searchRegex }] }).lean();
    console.log('Found:', users.length, users.map(u => u.name));
    process.exit(0);
});
