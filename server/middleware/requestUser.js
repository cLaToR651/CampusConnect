const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function requireUserId(req, res, next) {
    const authorization = req.header("authorization");
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    if (!token) return res.status(401).json({ message: "A Bearer access token is required" });
    if (!process.env.JWT_SECRET) return res.status(500).json({ message: "JWT_SECRET is not configured on the server" });

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: payload.sub, is_active: true }).lean();
        if (!user) return res.status(401).json({ message: "User account is unavailable" });
        req.user = user;
        req.userId = String(user._id);
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Your access token is invalid or expired" });
        }
        console.error(error);
        res.status(500).json({ message: "Unable to authenticate request" });
    }
}

function requireRoles(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "You do not have permission to perform this action" });
        }
        next();
    };
}

module.exports = { requireUserId, requireRoles };
