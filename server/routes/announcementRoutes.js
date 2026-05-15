const express = require('express');
const ann = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, ann.list);
router.post('/', protect, authorize('admin', 'teacher'), ann.create);
router.patch('/:id', protect, authorize('admin', 'teacher'), ann.update);
router.delete('/:id', protect, authorize('admin', 'teacher'), ann.remove);

module.exports = router;
