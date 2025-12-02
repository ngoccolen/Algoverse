const express = require("express");
const router = express.Router();
const practiceController = require("../controller/practiceController"); 
const { verifyToken } = require("../middleware/authMiddleware"); 

// --- THÊM DÒNG NÀY ĐỂ IMPORT CONTEST CONTROLLER ---
const contestController = require("../controller/ContestController"); 

// 1. Lấy danh sách bài tập
router.get("/problems", verifyToken, practiceController.getAllProblems);

// 2. Lấy chi tiết 1 bài tập
router.get("/problems/:id", verifyToken, practiceController.getProblemById);

// 3. Nộp bài
router.post("/submit/:id", verifyToken, practiceController.submitSolution);

// 4. Lịch sử
router.get("/history/:id", verifyToken, practiceController.getSubmissionHistory);

// 5. Chạy thử code (SỬA LẠI DÒNG NÀY)
// Thay 'authMiddleware' thành 'verifyToken' (vì bạn đã import nó ở trên)
router.post('/run', verifyToken, contestController.runContestCode);

module.exports = router;