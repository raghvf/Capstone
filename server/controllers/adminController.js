const {
  User,
  Student,
  Teacher,
  Department,
  Class,
  Schedule,
  AttendanceLog,
  PeriodwiseAttendanceLog,
  RecognitionLog,
} = require('../models');
const asyncHandler = require('../utils/asyncHandler');

const getOverview = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalStudents,
    totalTeachers,
    totalClasses,
    totalDepartments,
    presentToday,
    pendingEnrollments,
    recentRecognitions,
  ] = await Promise.all([
    Student.countDocuments(),
    Teacher.countDocuments(),
    Class.countDocuments(),
    Department.countDocuments(),
    AttendanceLog.countDocuments({
      recognizedAt: { $gte: today, $lt: tomorrow },
    }),
    Student.countDocuments({ enrollmentApproved: false }),
    RecognitionLog.find().sort({ recognizedAt: -1 }).limit(10),
  ]);

  res.json({
    totalStudents,
    totalTeachers,
    totalClasses,
    totalDepartments,
    presentToday,
    pendingEnrollments,
    recentRecognitions,
    attendanceRate: totalStudents
      ? Math.round((presentToday / totalStudents) * 100)
      : 0,
  });
});

const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    message: `Account ${user.isActive ? 'enabled' : 'disabled'}`,
    user: { id: user._id, email: user.email, isActive: user.isActive },
  });
});

const exportReport = asyncHandler(async (req, res) => {
  const { type = 'daily' } = req.query;
  const logs =
    type === 'period'
      ? await PeriodwiseAttendanceLog.find().sort({ recognizedAt: -1 })
      : await AttendanceLog.find().sort({ recognizedAt: -1 });

  res.json({
    type,
    count: logs.length,
    exportedAt: new Date(),
    data: logs,
  });
});

module.exports = { getOverview, toggleUserStatus, exportReport };
