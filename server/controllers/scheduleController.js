const { Schedule, Class, Student, Teacher } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const schedules = await Schedule.find()
    .populate({ path: 'class', populate: ['teacher', 'department'] })
    .sort({ dayOfWeek: 1, startTime: 1 });
  res.json(schedules);
});

const create = asyncHandler(async (req, res) => {
  const schedule = await Schedule.create(req.body);
  res.status(201).json({ message: 'Schedule created', schedule });
});

const update = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
  res.json({ message: 'Schedule updated', schedule });
});

const remove = asyncHandler(async (req, res) => {
  await Schedule.findByIdAndDelete(req.params.id);
  res.json({ message: 'Schedule deleted' });
});

const getMySchedule = asyncHandler(async (req, res) => {
  let classIds = [];

  if (req.user.role === 'student') {
    const student = await Student.findOne({ user: req.user._id });
    const classes = await Class.find({ students: student?._id });
    classIds = classes.map((c) => c._id);
  } else if (req.user.role === 'teacher') {
    const teacher = await Teacher.findOne({ user: req.user._id });
    classIds = teacher?.assignedClasses || [];
  }

  const schedules = await Schedule.find({ class: { $in: classIds } })
    .populate('class')
    .sort({ dayOfWeek: 1, startTime: 1 });

  res.json(schedules);
});

module.exports = { list, create, update, remove, getMySchedule };
