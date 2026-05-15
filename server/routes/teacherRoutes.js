const express = require('express');
const {
  listTeachers,
  createTeacher,
  updateTeacher,
  assignClass,
  getMyClasses,
} = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/my-classes', protect, authorize('teacher'), getMyClasses);
router.get('/', protect, authorize('admin'), listTeachers);
router.post('/', protect, authorize('admin'), createTeacher);
router.patch('/:id', protect, authorize('admin'), updateTeacher);
router.post('/:id/assign-class', protect, authorize('admin'), assignClass);

module.exports = router;
