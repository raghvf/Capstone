const express = require('express');
const cls = require('../controllers/classController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, cls.list);
router.post('/', protect, authorize('admin'), cls.create);
router.patch('/:id', protect, authorize('admin'), cls.update);
router.post('/:id/students', protect, authorize('admin', 'teacher'), cls.addStudent);

module.exports = router;
