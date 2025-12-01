const express = require("express");
const router = express.Router();
const practiceController = require("../controller/practiceController"); // Đảm bảo đường dẫn đúng
const { verifyToken } = require("../middleware/authMiddleware"); // Đảm bảo middleware đúng

// 1. Lấy danh sách bài tập
router.get("/problems", verifyToken, practiceController.getAllProblems);

// 2. Lấy chi tiết 1 bài tập (kèm test case public)
router.get("/problems/:id", verifyToken, practiceController.getProblemById);

// 3. Nộp bài / Chấm điểm (Run & Submit)
router.post("/submit/:id", verifyToken, practiceController.submitSolution);

// 4. Lấy lịch sử nộp bài
router.get("/history/:id", verifyToken, practiceController.getSubmissionHistory);

// === XÓA CÁC ROUTE CŨ KHÔNG CÒN DÙNG (VÍ DỤ GAME) ===
// router.get("/games", ...);  <-- Xóa dòng này nếu còn

module.exports = router;