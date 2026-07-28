const express = require('express');
const rateLimit = require('express-rate-limit');
const optionalAuth = require('../middleware/optionalAuth');
const { verifyToken } = require('../middleware/authMiddleware');
const controller = require('../controller/learningPathController');

const router = express.Router();
const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, code: 'PATH_RATE_LIMITED', message: 'Bạn đã tạo quá nhiều lộ trình. Vui lòng thử lại sau.' }
});

router.post('/survey', optionalAuth, controller.saveSurvey);
router.post('/generate', generateLimiter, optionalAuth, controller.generate);
router.get('/me', verifyToken, controller.getMine);
router.patch('/steps/:stepId', verifyToken, controller.updateStep);

module.exports = router;
