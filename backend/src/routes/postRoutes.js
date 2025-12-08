const express = require('express');
const router = express.Router();
const postController = require('../controller/postController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); 

router.get('/', postController.getPosts);

router.post('/', verifyToken, upload.single('image'), postController.createPost);

router.post('/:id/vote', verifyToken, postController.votePost);

router.post('/:id/comments', verifyToken, postController.addComment);
router.delete('/:id', verifyToken, postController.deletePost);

module.exports = router;