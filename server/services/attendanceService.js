const {
  Student,
  AttendanceLog,
  PeriodwiseAttendanceLog,
  RecognitionLog,
} = require('../models');
const { getDayBounds, getPeriodForTime } = require('../utils/dateUtils');
const { recognizeFace } = require('./faceApiService');

const logRecognition = async (data) => {
  return RecognitionLog.create(data);
};

const recordDailyAttendance = async ({
  usn,
  name,
  course,
  recognizedAt,
  method = 'face',
  markedBy,
  confidence,
  classId,
  subject,
  studentId,
}) => {
  const { start, end } = getDayBounds(recognizedAt ? new Date(recognizedAt) : new Date());

  const existing = await AttendanceLog.findOne({
    usn,
    recognizedAt: { $gte: start, $lt: end },
  });

  if (existing) {
    const err = new Error('Attendance already recorded for today');
    err.statusCode = 400;
    throw err;
  }

  return AttendanceLog.create({
    student: studentId,
    usn,
    name,
    course,
    class: classId,
    subject,
    method,
    markedBy,
    confidence,
    recognizedAt: recognizedAt || new Date(),
    status: 'present',
  });
};

const recordPeriodAttendance = async ({
  usn,
  name,
  course,
  recognizedAt,
  period,
  method = 'face',
  markedBy,
  confidence,
  classId,
  subject,
  studentId,
}) => {
  const now = recognizedAt ? new Date(recognizedAt) : new Date();
  const resolvedPeriod = period || getPeriodForTime(now);

  if (resolvedPeriod === 'No Period') {
    const err = new Error('No valid class period at this time');
    err.statusCode = 400;
    throw err;
  }

  const { start, end } = getDayBounds(now);

  const existing = await PeriodwiseAttendanceLog.findOne({
    usn,
    period: resolvedPeriod,
    recognizedAt: { $gte: start, $lt: end },
  });

  if (existing) {
    const err = new Error(`Attendance already recorded for ${resolvedPeriod} today`);
    err.statusCode = 400;
    throw err;
  }

  return PeriodwiseAttendanceLog.create({
    student: studentId,
    usn,
    name,
    course,
    period: resolvedPeriod,
    subject,
    class: classId,
    method,
    markedBy,
    confidence,
    recognizedAt: now,
    status: 'present',
  });
};

const processFaceAttendance = async ({ image, markedBy, classId, mode = 'period' }) => {
  const faceResult = await recognizeFace(image);
  const { usn, confidence, faces_detected: facesDetected } = faceResult.data;

  const isUnknown =
    !usn ||
    usn === 'Unknown' ||
    usn === 'No face detected' ||
    usn === 'No image' ||
    usn === 'Invalid image';

  await logRecognition({
    usn: isUnknown ? null : usn,
    confidence,
    status: isUnknown ? 'unknown' : 'recognized',
    facesDetected: facesDetected || 1,
    class: classId,
    markedBy,
    rawResponse: faceResult.data,
  });

  if (isUnknown) {
    const err = new Error(usn || 'Face not recognized');
    err.statusCode = 400;
    throw err;
  }

  const student = await Student.findOne({ usn: usn.toUpperCase() });
  if (!student) {
    const err = new Error('Student not enrolled in the system');
    err.statusCode = 404;
    throw err;
  }

  if (!student.enrollmentApproved) {
    const err = new Error('Student enrollment pending approval');
    err.statusCode = 403;
    throw err;
  }

  const payload = {
    usn: student.usn,
    name: student.name,
    course: student.course,
    studentId: student._id,
    markedBy,
    confidence,
    classId,
    method: 'face',
  };

  const log =
    mode === 'daily'
      ? await recordDailyAttendance(payload)
      : await recordPeriodAttendance(payload);

  return { student, log, confidence };
};

const getAttendanceAnalytics = async (filters = {}) => {
  const { startDate, endDate, course, usn } = filters;
  const query = {};

  if (startDate || endDate) {
    query.recognizedAt = {};
    if (startDate) query.recognizedAt.$gte = new Date(startDate);
    if (endDate) query.recognizedAt.$lte = new Date(endDate);
  }
  if (course) query.course = course;
  if (usn) query.usn = usn;

  const [dailyLogs, periodLogs, totalStudents] = await Promise.all([
    AttendanceLog.find(query).sort({ recognizedAt: -1 }),
    PeriodwiseAttendanceLog.find(query).sort({ recognizedAt: -1 }),
    Student.countDocuments({ enrollmentApproved: true }),
  ]);

  const today = getDayBounds();
  const presentToday = await AttendanceLog.countDocuments({
    recognizedAt: { $gte: today.start, $lt: today.end },
    ...query,
  });

  return {
    dailyLogs,
    periodLogs,
    totalStudents,
    presentToday,
    attendanceRate: totalStudents
      ? Math.round((presentToday / totalStudents) * 100)
      : 0,
  };
};

module.exports = {
  logRecognition,
  recordDailyAttendance,
  recordPeriodAttendance,
  processFaceAttendance,
  getAttendanceAnalytics,
};
