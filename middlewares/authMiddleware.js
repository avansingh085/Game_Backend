const Users = require('../models/User.js');
const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {

    const token = req.cookies?.accessToken;

    if (!token) {
        return res.status(401).json({
            success: false,
            result: "Authentication required"
        });
    }

    try {

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE);

        req.userId = decoded.id;

        const userExists = await Users.exists({ _id: decoded.id });
        if (!userExists) {
            return res.status(404).json({ success: false, result: "User no longer exists" });
        }

        next();
    } catch (err) {
        console.error("JWT Verification Error:", err.message);

        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                result: "Token expired",
                isExpired: true
            });
        }

        return res.status(401).json({ success: false, result: "Invalid token" });
    }
};

module.exports = verifyToken;