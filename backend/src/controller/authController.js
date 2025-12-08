const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail"); 

const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );

    const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE }
    );

    return { accessToken, refreshToken };
};


exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password)
            return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin." });
        const [exist] = await db.query(
            "SELECT * FROM users WHERE email = ? OR username = ?",
            [email, username]
        );

        if (exist.length > 0)
            return res.status(400).json({ success: false, message: "Email hoặc Username đã tồn tại!" });
        const hashed = await bcrypt.hash(password, 10);
        const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff`;
        const [result] = await db.query(
            "INSERT INTO users (username, email, password, avatar) VALUES (?, ?, ?, ?)",
            [username, email, hashed, defaultAvatar]
        );
        const newUser = {
            id: result.insertId,
            username: username,
            email: email,
            avatar: defaultAvatar,
            xp: 0,
            level: 1
        };
        const tokens = generateTokens(newUser);
        res.json({
            success: true,
            message: "Đăng ký thành công!",
            ...tokens,
            user: newUser
        });

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ success: false, message: "Lỗi Server: " + error.message });
    }
};


exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const [rows] = await db.query(
            "SELECT * FROM users WHERE email = ? OR username = ?", 
            [username, username]
        );
        if (rows.length === 0)
            return res.status(400).json({ success: false, msg: "Tài khoản không tồn tại!" });

        const user = rows[0];
        const check = await bcrypt.compare(password, user.password);
        if (!check)
            return res.status(400).json({ success: false, msg: "Sai mật khẩu!" });

        const tokens = generateTokens(user);
        const avatarUrl = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&color=fff`;

        res.json({
            success: true,
            ...tokens,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar: avatarUrl,
                xp: user.xp,
                level: user.level,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, msg: error.message });
    }
};

exports.refreshToken = async (req, res) => {
    const { token } = req.body;

    if (!token)
        return res.status(401).json({ message: "Refresh token không được để trống!" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

        const newAccessToken = jwt.sign(
            { id: decoded.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.json({ accessToken: newAccessToken });

    } catch (err) {
        res.status(403).json({ message: "Refresh token không hợp lệ hoặc đã hết hạn!" });
    }
};

exports.googleCallback = async (req, res) => {
    const user = req.user;

    const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );

    const redirectUrl =
        `${process.env.FRONTEND_URL}/login-success` +
        `?token=${token}` +
        `&id=${user.id}` +
        `&username=${encodeURIComponent(user.username)}` +
        `&email=${encodeURIComponent(user.email)}`;

    return res.redirect(redirectUrl);
};


exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email)
        return res.status(400).json({ message: "Email không được để trống" });

    try {
        const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length === 0)
            return res.status(404).json({ message: "Email không tồn tại!" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

        await db.execute(
            `UPDATE users SET reset_token = ?, reset_token_expire = DATE_ADD(NOW(), INTERVAL 10 MINUTE)
             WHERE email = ?`,
            [hashedOtp, email]
        );

        await sendEmail(
            email,
            "Your OTP Code",
            `<h2>Your OTP: ${otp}</h2><p>Mã có hiệu lực trong 10 phút.</p>`
        );

        res.json({ message: "Đã gửi OTP qua email!" });

    } catch (err) {
        console.error("Forgot Password Error:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
};


exports.resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword)
        return res.status(400).json({ message: "Thiếu dữ liệu!" });

    try {
        const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

        const [rows] = await db.execute(
            `SELECT * FROM users 
             WHERE email = ? AND reset_token = ? AND reset_token_expire > NOW()`,
            [email, hashedOtp]
        );

        if (rows.length === 0)
            return res.status(400).json({ message: "OTP không đúng hoặc đã hết hạn!" });

        const hashPassword = await bcrypt.hash(newPassword, 10);

        await db.execute(
            `UPDATE users SET password = ?, reset_token = NULL, reset_token_expire = NULL 
             WHERE email = ?`,
            [hashPassword, email]
        );

        res.json({ message: "Đặt lại mật khẩu thành công!" });

    } catch (err) {
        console.error("Reset Password Error:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
};