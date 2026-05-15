const express = require('express');
const {
  getDailyLogs,
  getPeriodLogs,
  logDaily,
  logPeriod,
  faceAttendance,
  getAnalytics,
  getMyAttendanceStats,
  requestCorrection,
  reviewCorrection,
  listCorrections,
  getRecognitionLogs,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/daily', protect, getDailyLogs);
router.get('/period', protect, getPeriodLogs);
router.get('/analytics', protect, authorize('admin', 'teacher'), getAnalytics);
router.get('/my-stats', protect, authorize('student'), getMyAttendanceStats);
router.get('/recognition-logs', protect, authorize('admin', 'teacher'), getRecognitionLogs);
router.get('/corrections', protect, authorize('admin', 'teacher'), listCorrections);

router.post('/daily', protect, authorize('admin', 'teacher'), logDaily);
router.post('/period', protect, logPeriod);
router.post('/face', protect, authorize('admin', 'teacher'), faceAttendance);
router.post('/corrections', protect, authorize('student'), requestCorrection);
router.patch('/corrections/:id', protect, authorize('admin', 'teacher'), reviewCorrection);

module.exports = router;
