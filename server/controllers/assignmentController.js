const { Assignment, Teacher, Class } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.classId) filter.class = req.query.classId;

  if (req.user.role === 'student') {
    const { Student } = require('../models');
    const student = await Student.findOne({ user: req.user._id });
    const classes = await Class.find({ students: student?._id });
    filter.class = { $in: classes.map((c) => c._id) };
  } else if (req.user.role === 'teacher') {
    const teacher = await Teacher.findOne({ user: req.user._id });
    filter.teacher = teacher?._id;
  }

  const assignments = await Assignment.find(filter)
    .populate('class')
    .populate('teacher')
    .sort({ dueDate: 1 });
  res.json(assignments);
});

const create = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id });
  if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

  const assignment = await Assignment.create({
    ...req.body,
    teacher: teacher._id,
  });
  res.status(201).json({ message: 'Assignment created', assignment });
});

const update = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
  res.json({ message: 'Assignment updated', assignment });
});

const remove = asyncHandler(async (req, res) => {
  await Assignment.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ message: 'Assignment removed' });
});

module.exports = { list, create, update, remove };
