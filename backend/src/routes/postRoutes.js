// backend/src/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../controller/postController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Middleware upload ảnh

// 1. Lấy danh sách bài viết (Có hỗ trợ filter, search, sort)
router.get('/', postController.getPosts);

// 2. Tạo bài viết mới (Cần đăng nhập & Hỗ trợ upload 1 file ảnh có key là 'image')
// Lưu ý: Phải đặt upload.single('image') sau verifyToken
router.post('/', verifyToken, upload.single('image'), postController.createPost);

// 3. Like / Unlike bài viết (Cần đăng nhập)
router.post('/:id/vote', verifyToken, postController.votePost);

// 4. Bình luận vào bài viết (Cần đăng nhập)
router.post('/:id/comments', verifyToken, postController.addComment);

module.exports = router;