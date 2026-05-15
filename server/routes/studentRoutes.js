const express = require('express');
const {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  approveEnrollment,
  enrollFaceForStudent,
  deleteStudent,
  getMyProfile,
  updateMyProfile,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/me', protect, authorize('student'), getMyProfile);
router.patch('/me', protect, authorize('student'), updateMyProfile);

router.get('/', protect, authorize('admin', 'teacher'), listStudents);
router.get('/:id', protect, authorize('admin', 'teacher'), getStudent);
router.post('/', protect, authorize('admin'), createStudent);
router.patch('/:id', protect, authorize('admin'), updateStudent);
router.patch('/:id/approve', protect, authorize('admin'), approveEnrollment);
router.post('/enroll-face', protect, authorize('admin', 'teacher'), enrollFaceForStudent);
router.delete('/:id', protect, authorize('admin'), deleteStudent);

module.exports = router;
