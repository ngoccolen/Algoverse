const express = require('express');
const router = express.Router();
const ProblemController = require('../controller/problemController');

router.post('/create', ProblemController.createManual); 
router.put('/:id', ProblemController.update);           
router.get('/:id', ProblemController.getDetail);        

module.exports = router;