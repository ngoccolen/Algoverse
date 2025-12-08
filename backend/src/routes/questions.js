const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const questionsController = require("../controller/questionsController");

router.get("/:id", questionsController.getQuestionsByAlgorithm);

router.post("/:id/submit", verifyToken, questionsController.submitQuestions);

module.exports = router;