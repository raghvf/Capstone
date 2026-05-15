const { Class, Student } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'teacher') {
    const { Teacher } = require('../models');
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (teacher) filter.teacher = teacher._id;
  }
  const classes = await Class.find(filter)
    .populate('teacher')
    .populate('department')
    .populate('students');
  res.json(classes);
});

const create = asyncHandler(async (req, res) => {
  const cls = await Class.create(req.body);
  res.status(201).json({ message: 'Class created', class: cls });
});

const update = asyncHandler(async (req, res) => {
  const cls = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!cls) return res.status(404).json({ message: 'Class not found' });
  res.json({ message: 'Class updated', class: cls });
});

const addStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.body;
  const cls = await Class.findById(req.params.id);
  if (!cls) return res.status(404).json({ message: 'Class not found' });

  if (!cls.students.includes(studentId)) {
    cls.students.push(studentId);
    await cls.save();
  }
  res.json({ message: 'Student added to class', class: cls });
});

module.exports = { list, create, update, addStudent };
