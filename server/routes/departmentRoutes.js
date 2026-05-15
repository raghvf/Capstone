const express = require('express');
const dept = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, dept.list);
router.post('/', protect, authorize('admin'), dept.create);
router.patch('/:id', protect, authorize('admin'), dept.update);
router.delete('/:id', protect, authorize('admin'), dept.remove);

module.exports = router;
