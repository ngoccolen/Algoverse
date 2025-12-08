// routes/submissionRoutes.js

const express = require('express');
const router = express.Router();
const submissionController = require('../controller/submissionController'); 
const { verifyToken } = require('../middleware/authMiddleware'); // Đảm bảo đường dẫn đúng tới middleware

// Định nghĩa route nộp bài
// Đường dẫn đầy đủ sẽ là: /api/submissions/submit
router.post('/submit', verifyToken, submissionController.submitCode);

module.exports = router;