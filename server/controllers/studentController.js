const { Student, User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { enrollFace } = require('../services/faceApiService');

const listStudents = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.approved !== undefined) {
    filter.enrollmentApproved = req.query.approved === 'true';
  }
  const students = await Student.find(filter)
    .populate('user', 'email username isActive')
    .populate('department')
    .sort({ enrolledAt: -1 });
  res.json(students);
});

const getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id)
    .populate('user', 'email username isActive')
    .populate('department');
  if (!student) return res.status(404).json({ message: 'Student not found' });
  res.json(student);
});

const createStudent = asyncHandler(async (req, res) => {
  const { name, usn, age, course, phone, department, email, password, username } = req.body;

  const existingUsn = await Student.findOne({ usn: usn.toUpperCase() });
  if (existingUsn) {
    return res.status(400).json({ message: 'USN already exists' });
  }

  let userId = req.user?._id;

  if (req.user?.role === 'admin' && email) {
    const user = await User.create({
      username: username || usn,
      email,
      password: password || `Student@${usn}`,
      role: 'student',
    });
    userId = user._id;
  }

  const student = await Student.create({
    user: userId,
    name,
    usn: usn.toUpperCase(),
    age,
    course,
    phone,
    department,
    enrollmentApproved: req.user?.role === 'admin',
  });

  res.status(201).json({ message: 'Student created', student });
});

const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!student) return res.status(404).json({ message: 'Student not found' });
  res.json({ message: 'Student updated', student });
});

const approveEnrollment = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndUpdate(
    req.params.id,
    { enrollmentApproved: true },
    { new: true }
  );
  if (!student) return res.status(404).json({ message: 'Student not found' });
  res.json({ message: 'Enrollment approved', student });
});

const enrollFaceForStudent = asyncHandler(async (req, res) => {
  const { usn, image } = req.body;
  if (!usn || !image) {
    return res.status(400).json({ message: 'USN and image are required' });
  }

  const student = await Student.findOne({ usn: usn.toUpperCase() });
  if (!student) return res.status(404).json({ message: 'Student not found' });

  const result = await enrollFace(usn.toUpperCase(), image);
  student.faceEnrolled = true;
  await student.save();

  res.json({ message: result.data.message || 'Face enrolled', student });
});

const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  res.json({ message: 'Student deleted' });
});

const getMyProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id }).populate('department');
  if (!student) return res.status(404).json({ message: 'Student profile not found' });
  res.json(student);
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const allowed = ['phone', 'age'];
  const updates = {};
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  });

  const student = await Student.findOneAndUpdate({ user: req.user._id }, updates, {
    new: true,
  });
  res.json({ message: 'Profile updated', student });
});

module.exports = {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  approveEnrollment,
  enrollFaceForStudent,
  deleteStudent,
  getMyProfile,
  updateMyProfile,
};
