// src/routes/algorithm.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// --- 1. IMPORT CÁC MIDDLEWARE & CONTROLLER ---

// [SỬA QUAN TRỌNG]: Thêm dấu ngoặc nhọn { } để lấy đúng hàm verifyToken
const { verifyToken } = require('../middleware/authMiddleware'); 

const optionalAuth = require('../middleware/optionalAuth'); 
const algorithmController = require('../controller/algorithmController');

// --- 2. MIDDLEWARE HELPER (Lấy ID từ Key) ---
const getAlgorithmIdByKey = async (req, res, next) => {
    try {
        const { algKey } = req.params;
        if (!algKey) return next();

        const [rows] = await db.query('SELECT id FROM algorithms WHERE alg_key = ?', [algKey]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Algorithm key not found' });
        }
        
        // Gán ID vào request
        req.algorithmId = rows[0].id;
        req.params.id = rows[0].id; 
        next();
    } catch (err) {
        console.error("Middleware Error:", err);
        res.status(500).json({ success: false, message: 'Server error looking up algorithm' });
    }
};

// --- 3. ĐỊNH NGHĨA ROUTE ---

// API 1: Lấy danh sách thuật toán
router.get('/', optionalAuth, algorithmController.getAlgorithms);

// API 2: Lấy chi tiết bài học
router.get('/:algKey', optionalAuth, algorithmController.getAlgorithmByKey);

// API 3: Nộp bài Trắc nghiệm (BẮT BUỘC AUTH)
router.post(
    '/:algKey/submit-answer', 
    verifyToken,         // <--- Đã đổi từ 'auth' thành 'verifyToken'
    getAlgorithmIdByKey, 
    algorithmController.submitQuestions 
);

// API 4: Nộp bài Code (BẮT BUỘC AUTH)
router.post(
    '/:algKey/submit-code', 
    verifyToken,         // <--- Đã đổi từ 'auth' thành 'verifyToken'
    getAlgorithmIdByKey, 
    algorithmController.submitCode 
);

module.exports = router;