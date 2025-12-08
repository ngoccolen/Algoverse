// routes/contestRoutes.js
const express = require("express");
const router = express.Router();
const ContestController = require("../controller/ContestController");
// Xóa dòng import SubmissionController nếu không dùng ở route khác
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware"); 

router.post("/create", verifyToken, verifyAdmin, ContestController.create);
router.post("/add-problem", verifyToken, verifyAdmin, ContestController.addProblemToContest);
router.put("/:id", verifyToken, verifyAdmin, ContestController.update); 
router.delete("/:id", verifyToken, verifyAdmin, ContestController.deleteContest); 
router.get("/", ContestController.getAll);
router.post("/register", verifyToken, ContestController.registerContest);
router.post("/run", verifyToken, ContestController.runCode); 


router.get("/:id/check-registration", verifyToken, ContestController.checkRegistration);
router.get("/:id/leaderboard", ContestController.getLeaderboard);
router.get("/:id", verifyToken, ContestController.getDetail);

module.exports = router;