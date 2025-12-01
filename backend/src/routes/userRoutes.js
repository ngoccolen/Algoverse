// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// --- CẤU HÌNH UPLOAD ẢNH (MULTER) ---
// Ảnh sẽ được lưu vào thư mục 'backend/uploads'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        // Đặt tên file để tránh trùng lặp: avatar-timestamp.jpg
        cb(null, `avatar-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// ==========================================
// ĐỊNH NGHĨA ROUTES
// ==========================================

// 1. Lấy thông tin hồ sơ (Profile + Stats + History)
router.get('/profile', verifyToken, userController.getProfile);

// 2. Cập nhật thông tin cá nhân (Bio, Location)
router.put('/profile', verifyToken, userController.updateProfile);

// 3. Upload ảnh đại diện (Avatar)
// Middleware upload.single('avatar') sẽ xử lý file gửi lên từ form-data có key là 'avatar'
router.post('/avatar', verifyToken, upload.single('avatar'), userController.uploadAvatar);

module.exports = router;