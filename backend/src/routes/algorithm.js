const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/authMiddleware'); 
const optionalAuth = require('../middleware/optionalAuth'); 
const algorithmController = require('../controller/algorithmController');

const getAlgorithmIdByKey = async (req, res, next) => {
    try {
        const { algKey } = req.params;
        if (!algKey) return next();

        const [rows] = await db.query('SELECT id FROM algorithms WHERE alg_key = ?', [algKey]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Algorithm key not found' });
        }
        
        req.algorithmId = rows[0].id;
        req.params.id = rows[0].id; 
        next();
    } catch (err) {
        console.error("Middleware Error:", err);
        res.status(500).json({ success: false, message: 'Server error looking up algorithm' });
    }
};

//Lấy danh sách thuật toán
router.get('/', optionalAuth, algorithmController.getAlgorithms);

//Lấy chi tiết bài học
router.get('/:algKey', optionalAuth, algorithmController.getAlgorithmByKey);

//Nộp bài Trắc nghiệm 
router.post(
    '/:algKey/submit-answer', 
    verifyToken,       
    getAlgorithmIdByKey, 
    algorithmController.submitQuestions 
);

//Nộp bài Code 
router.post(
    '/:algKey/submit-code', 
    verifyToken,         
    getAlgorithmIdByKey, 
    algorithmController.submitCode 
);

module.exports = router;