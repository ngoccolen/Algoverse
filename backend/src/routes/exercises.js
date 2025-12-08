// exercises.js
const express = require("express");
const router = express.Router();
const exercisesController = require("../controller/exercisesController");

// [SỬA]: Gọi đúng file authMiddleware và dùng { verifyToken, verifyAdmin }
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

// --- ADMIN ROUTES ---
// [THÊM MỚI] Route Admin tạo bài tập luyện tập (Bảo vệ bằng verifyAdmin)
router.post("/create", verifyToken, verifyAdmin, exercisesController.createExercise);

// --- USER ROUTES ---
// Lấy chi tiết bài tập theo ID thuật toán
router.get("/:id", exercisesController.getExerciseByAlgorithm);

// [SỬA]: Đổi 'auth' thành 'verifyToken' cho nộp bài
router.post("/:id/submit", verifyToken, exercisesController.submitExercise);

module.exports = router;