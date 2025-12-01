const jwt = require("jsonwebtoken");
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : req.cookies?.accessToken;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access Denied: No Token Provided",
        });
    }

    try {
        // [QUAN TRỌNG] Chỉ dùng đúng 1 biến JWT_SECRET để khớp với .env và Controller
        const secret = process.env.JWT_SECRET;
        
        if (!secret) {
            console.error("❌ LỖI: Chưa cấu hình JWT_SECRET trong file .env");
            return res.status(500).json({ success: false, message: "Server Configuration Error" });
        }

        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (err) {
        console.error("JWT Verify Error:", err.message);
        return res.status(403).json({
            success: false,
            message: "Phiên đăng nhập hết hạn hoặc không hợp lệ.",
        });
    }
};

module.exports = { verifyToken };