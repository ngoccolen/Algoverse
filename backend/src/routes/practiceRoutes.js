const express = require("express");
const router = express.Router();
const practiceController = require("../controller/practiceController"); 
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware"); 
const contestController = require("../controller/ContestController"); 
router.get("/problems", verifyToken, practiceController.getAllProblems);
router.get("/problems/:id", verifyToken, practiceController.getProblemById);
router.post("/submit/:id", verifyToken, practiceController.submitSolution);
router.get("/history/:id", verifyToken, practiceController.getSubmissionHistory);
router.post('/run', verifyToken, contestController.runCode); 

router.get("/all-titles", verifyToken, verifyAdmin, practiceController.getAllProblemTitles); 

router.put("/problems/:id", verifyToken, verifyAdmin, practiceController.updateProblem); 

router.delete("/problems/:id", verifyToken, verifyAdmin, practiceController.deleteProblem); 

router.post("/problems/create", verifyToken, verifyAdmin, practiceController.createNewProblem);

router.post("/exercises/create", verifyToken, verifyAdmin, practiceController.createNewExercise);

module.exports = router;