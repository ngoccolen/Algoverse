// src/middleware/optionalAuth.js
const jwt = require("jsonwebtoken");

const optionalAuth = (req, res, next) => {
    // 1. Lấy token từ header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    // 2. Nếu không có token -> Cho qua (khách vãng lai)
    if (!token) {
        return next();
    }

    // 3. Nếu có token -> Thử giải mã
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
        req.user = decoded; // Token đúng -> Lưu user
        next();
    } catch (err) {
        // 4. Token sai/hết hạn -> Vẫn cho qua, nhưng không lưu user
        req.user = null;
        next();
    }
};

module.exports = optionalAuth;