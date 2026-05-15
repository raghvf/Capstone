const { User, Admin, Teacher, Student } = require('../models');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');

const buildProfile = async (user) => {
  if (user.role === 'admin') {
    return Admin.findOne({ user: user._id }).populate('user', '-password');
  }
  if (user.role === 'teacher') {
    return Teacher.findOne({ user: user._id })
      .populate('department')
      .populate('assignedClasses');
  }
  if (user.role === 'student') {
    return Student.findOne({ user: user._id }).populate('department');
  }
  return null;
};

const register = asyncHandler(async (req, res) => {
  const { username, email, password, role = 'admin', profile = {} } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  const user = await User.create({
    username,
    email,
    password,
    role,
  });

  if (role === 'admin') {
    await Admin.create({ user: user._id, name: profile.name || username });
  } else if (role === 'teacher') {
    await Teacher.create({
      user: user._id,
      name: profile.name || username,
      employeeId: profile.employeeId || `TCH-${Date.now()}`,
      department: profile.department,
    });
  } else if (role === 'student') {
    await Student.create({
      user: user._id,
      name: profile.name || username,
      usn: (profile.usn || `STU-${user._id.toString().slice(-6)}`).toUpperCase(),
      age: profile.age || '',
      course: profile.course || 'General',
      phone: profile.phone || '',
      department: profile.department,
      enrollmentApproved: false,
    });
  }

  const token = generateToken(user._id, user.role);
  const userProfile = await buildProfile(user);

  res.status(201).json({
    message: 'Registration successful',
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    profile: userProfile,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    $or: [{ email: email?.toLowerCase() }, { username: email }],
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (!user.isActive) {
    return res.status(403).json({ message: 'Account is disabled' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id, user.role);
  const profile = await buildProfile(user);

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    profile,
  });
});

const getMe = asyncHandler(async (req, res) => {
  const profile = await buildProfile(req.user);
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
    },
    profile,
  });
});

module.exports = { register, login, getMe };
