const jwt = require("jsonwebtoken");

const optionalAuth = (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
        req.user = decoded; 
        next();
    } catch (err) {
        req.user = null;
        next();
    }
};

module.exports = optionalAuth;