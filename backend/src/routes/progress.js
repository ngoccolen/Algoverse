const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const progressController = require("../controller/progressController");

router.get("/:algorithm_id", verifyToken, progressController.getProgress);
router.post("/update", verifyToken, progressController.updateProgress);

module.exports = router;