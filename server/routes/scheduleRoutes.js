const express = require('express');
const sched = require('../controllers/scheduleController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/my', protect, sched.getMySchedule);
router.get('/', protect, sched.list);
router.post('/', protect, authorize('admin'), sched.create);
router.patch('/:id', protect, authorize('admin'), sched.update);
router.delete('/:id', protect, authorize('admin'), sched.remove);

module.exports = router;
