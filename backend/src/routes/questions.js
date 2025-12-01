const express = require("express");
const router = express.Router();

// [SỬA]: Gọi đúng file authMiddleware và dùng { verifyToken }
const { verifyToken } = require("../middleware/authMiddleware");
const questionsController = require("../controller/questionsController");

router.get("/:id", questionsController.getQuestionsByAlgorithm);

// [SỬA]: Đổi 'auth' thành 'verifyToken'
router.post("/:id/submit", verifyToken, questionsController.submitQuestions);

module.exports = router;