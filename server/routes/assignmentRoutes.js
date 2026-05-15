const express = require('express');
const assign = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, assign.list);
router.post('/', protect, authorize('teacher'), assign.create);
router.patch('/:id', protect, authorize('teacher', 'admin'), assign.update);
router.delete('/:id', protect, authorize('teacher', 'admin'), assign.remove);

module.exports = router;
