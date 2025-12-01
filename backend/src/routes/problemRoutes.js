const express = require('express');
const router = express.Router();
const ProblemController = require('../controller/problemController');

router.post('/create', ProblemController.createManual); // Tạo mới
router.put('/:id', ProblemController.update);           // Sửa bài
router.get('/:id', ProblemController.getDetail);        // Lấy thông tin

module.exports = router;