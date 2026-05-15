const express = require('express');
const { getOverview, toggleUserStatus, exportReport } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/overview', getOverview);
router.patch('/users/:id/toggle', toggleUserStatus);
router.get('/export', exportReport);

module.exports = router;
