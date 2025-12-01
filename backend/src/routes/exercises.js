const express = require("express");
const router = express.Router();
const exercisesController = require("../controller/exercisesController");

// [SỬA]: Gọi đúng file authMiddleware và dùng { verifyToken }
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/:id", exercisesController.getExerciseByAlgorithm);

// [SỬA]: Đổi 'auth' thành 'verifyToken'
router.post("/:id/submit", verifyToken, exercisesController.submitExercise);

module.exports = router;