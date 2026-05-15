const {
  AttendanceLog,
  PeriodwiseAttendanceLog,
  Student,
  AttendanceCorrection,
  RecognitionLog,
} = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const {
  recordDailyAttendance,
  recordPeriodAttendance,
  processFaceAttendance,
  getAttendanceAnalytics,
} = require('../services/attendanceService');
const { getDayBounds } = require('../utils/dateUtils');

const getDailyLogs = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'student') {
    const student = await Student.findOne({ user: req.user._id });
    if (student) filter.usn = student.usn;
  }
  const logs = await AttendanceLog.find(filter).sort({ recognizedAt: -1 });
  res.json(logs);
});

const getPeriodLogs = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'student') {
    const student = await Student.findOne({ user: req.user._id });
    if (student) filter.usn = student.usn;
  }
  const logs = await PeriodwiseAttendanceLog.find(filter).sort({ recognizedAt: -1 });
  res.json(logs);
});

const logDaily = asyncHandler(async (req, res) => {
  const { usn, name, course, recognizedAt } = req.body;
  if (!usn) return res.status(400).json({ message: 'USN is required' });

  const student = await Student.findOne({ usn: usn.toUpperCase() });
  if (!student && (!name || !course)) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const log = await recordDailyAttendance({
    usn: usn.toUpperCase(),
    name: student?.name || name,
    course: student?.course || course,
    recognizedAt,
    method: 'manual',
    markedBy: req.user?._id,
    studentId: student?._id,
  });

  res.json({ message: 'Attendance logged successfully', log });
});

const logPeriod = asyncHandler(async (req, res) => {
  const { usn, recognizedAt, period } = req.body;
  if (!usn) return res.status(400).json({ message: 'USN is required' });

  const student = await Student.findOne({ usn: usn.toUpperCase() });
  if (!student) return res.status(404).json({ message: 'Student not found' });

  const log = await recordPeriodAttendance({
    usn: student.usn,
    name: student.name,
    course: student.course,
    recognizedAt,
    period,
    method: req.body.method || 'face',
    markedBy: req.user?._id,
    confidence: req.body.confidence,
    studentId: student._id,
  });

  res.json({ message: `Period-wise attendance recorded for ${log.period}`, log });
});

const faceAttendance = asyncHandler(async (req, res) => {
  const { image, classId, mode = 'period' } = req.body;
  if (!image) return res.status(400).json({ message: 'Image is required' });

  const result = await processFaceAttendance({
    image,
    markedBy: req.user?._id,
    classId,
    mode,
  });

  res.json({
    message: 'Attendance recorded via face recognition',
    student: result.student,
    log: result.log,
    confidence: result.confidence,
  });
});

const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await getAttendanceAnalytics(req.query);
  res.json(analytics);
});

const getMyAttendanceStats = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) return res.status(404).json({ message: 'Student profile not found' });

  const logs = await AttendanceLog.find({ usn: student.usn }).sort({ recognizedAt: -1 });
  const periodLogs = await PeriodwiseAttendanceLog.find({ usn: student.usn }).sort({
    recognizedAt: -1,
  });

  const { start, end } = getDayBounds();
  const daysInMonth = 30;
  const monthStart = new Date();
  monthStart.setDate(monthStart.getDate() - daysInMonth);

  const monthlyPresent = await AttendanceLog.countDocuments({
    usn: student.usn,
    recognizedAt: { $gte: monthStart },
  });

  const percentage = Math.min(100, Math.round((monthlyPresent / daysInMonth) * 100));

  res.json({
    student,
    dailyLogs: logs,
    periodLogs,
    attendancePercentage: percentage,
    totalPresent: logs.length,
  });
});

const requestCorrection = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) return res.status(404).json({ message: 'Student profile not found' });

  const correction = await AttendanceCorrection.create({
    student: student._id,
    usn: student.usn,
    date: req.body.date,
    period: req.body.period,
    reason: req.body.reason,
  });

  res.status(201).json({ message: 'Correction request submitted', correction });
});

const reviewCorrection = asyncHandler(async (req, res) => {
  const correction = await AttendanceCorrection.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
      reviewNote: req.body.reviewNote,
      reviewedBy: req.user._id,
    },
    { new: true }
  );
  if (!correction) return res.status(404).json({ message: 'Request not found' });
  res.json({ message: 'Correction reviewed', correction });
});

const listCorrections = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const corrections = await AttendanceCorrection.find(filter)
    .populate('student')
    .sort({ createdAt: -1 });
  res.json(corrections);
});

const getRecognitionLogs = asyncHandler(async (req, res) => {
  const logs = await RecognitionLog.find()
    .populate('markedBy', 'username email')
    .sort({ recognizedAt: -1 })
    .limit(200);
  res.json(logs);
});

module.exports = {
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
};
