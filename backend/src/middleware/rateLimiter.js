const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Giới hạn 5 requests per window
  message: { success: false, message: 'Too many requests, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = authLimiter;