const express = require("express");
const router = express.Router();

// [SỬA]: Gọi đúng file authMiddleware và dùng { verifyToken }
const { verifyToken } = require("../middleware/authMiddleware");
const progressController = require("../controller/progressController");

// [SỬA]: Đổi 'auth' thành 'verifyToken'
router.get("/:algorithm_id", verifyToken, progressController.getProgress);
router.post("/update", verifyToken, progressController.updateProgress);

module.exports = router;