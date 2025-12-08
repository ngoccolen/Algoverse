const jwt = require("jsonwebtoken");
const db = require('../../src/db'); 
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : req.cookies?.accessToken;

    if (!token) return res.status(401).json({ success: false, message: "No Token Provided" });

    try {
        const secret = process.env.JWT_SECRET;
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: "Token Invalid" });
    }
};

const verifyAdmin = async (req, res, next) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Chưa đăng nhập" });

        const [users] = await db.query("SELECT role FROM users WHERE id = ?", [req.user.id]);
        
        if (users.length === 0 || users[0].role !== 'admin') {
            return res.status(403).json({ message: "Truy cập bị từ chối! Bạn không phải Admin." });
        }

        next();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Lỗi server khi check admin" });
    }
};

module.exports = { verifyToken, verifyAdmin };