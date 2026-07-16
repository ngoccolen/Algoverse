// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controller/chatController');

// POST /api/chat - Gửi tin nhắn cho AI
router.post('/', chatController.chat);

module.exports = router;
