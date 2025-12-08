const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, `avatar-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });



router.get('/profile', verifyToken, userController.getProfile);

router.put('/profile', verifyToken, userController.updateProfile);
router.post('/avatar', verifyToken, upload.single('avatar'), userController.uploadAvatar);

module.exports = router;