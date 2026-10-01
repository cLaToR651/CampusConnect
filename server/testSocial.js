const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");
const FriendRequest = require("./models/FriendRequest");
const GlobalMessage = require("./models/GlobalMessage");
const DirectMessage = require("./models/DirectMessage");

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const u = await User.findOne();
        const req = { userId: String(u._id) };
        
        console.log("Testing Users...");
        const users = await User.find({
            is_active: true,
            _id: { $ne: req.userId },
            $or: [{ name: new RegExp('', 'i') }, { username: new RegExp('', 'i') }]
        }).populate("department", "name").limit(100).lean();
        console.log("Users:", users.length);

        console.log("Testing Friends...");
        const acceptedRequests = await FriendRequest.find({
            status: 'accepted',
            $or: [{ sender: req.userId }, { receiver: req.userId }]
        }).lean();
        console.log("Friends count:", acceptedRequests.length);

        console.log("Testing Friend Requests...");
        const requests = await FriendRequest.find({ receiver: req.userId, status: 'pending' })
            .populate("sender", "name username").lean();
        console.log("Friend Requests:", requests.length);

        console.log("Testing Global Messages...");
        const msgs = await GlobalMessage.find().populate("user", "name").lean();
        console.log("Global Messages:", msgs.length);
        
    } catch(e) {
        console.error("FAIL:", e);
    }
    process.exit(0);
});
