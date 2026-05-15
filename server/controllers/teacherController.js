const { Teacher, User, Class } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

const listTeachers = asyncHandler(async (req, res) => {
  const teachers = await Teacher.find()
    .populate('user', 'email username isActive')
    .populate('department')
    .populate('assignedClasses');
  res.json(teachers);
});

const createTeacher = asyncHandler(async (req, res) => {
  const { name, employeeId, email, password, username, department, phone } = req.body;

  const user = await User.create({
    username: username || employeeId,
    email,
    password,
    role: 'teacher',
  });

  const teacher = await Teacher.create({
    user: user._id,
    name,
    employeeId,
    department,
    phone,
  });

  res.status(201).json({ message: 'Teacher created', teacher });
});

const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('assignedClasses');
  if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
  res.json({ message: 'Teacher updated', teacher });
});

const assignClass = asyncHandler(async (req, res) => {
  const { classId } = req.body;
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

  const cls = await Class.findByIdAndUpdate(classId, { teacher: teacher._id });
  if (!cls) return res.status(404).json({ message: 'Class not found' });

  if (!teacher.assignedClasses.includes(classId)) {
    teacher.assignedClasses.push(classId);
    await teacher.save();
  }

  res.json({ message: 'Class assigned to teacher', teacher });
});

const getMyClasses = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id }).populate({
    path: 'assignedClasses',
    populate: { path: 'students department' },
  });
  if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });
  res.json(teacher.assignedClasses);
});

module.exports = {
  listTeachers,
  createTeacher,
  updateTeacher,
  assignClass,
  getMyClasses,
};
