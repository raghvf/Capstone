/**
 * Backward-compatible routes for existing frontend pages
 */
const express = require('express');
const { Student, AttendanceLog, PeriodwiseAttendanceLog } = require('../models');
const { recordDailyAttendance, recordPeriodAttendance } = require('../services/attendanceService');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post(
  '/students',
  asyncHandler(async (req, res) => {
    const { name, usn, age, course, phone } = req.body;
    if (!name || !usn || !age || !course || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await Student.findOne({ usn: usn.toUpperCase() });
    if (existing) return res.status(400).json({ message: 'USN already exists' });

    const student = await Student.create({
      name,
      usn: usn.toUpperCase(),
      age,
      course,
      phone,
      enrollmentApproved: true,
    });

    res.status(200).json({ message: 'Student saved to database!', student });
  })
);

router.get(
  '/students',
  asyncHandler(async (req, res) => {
    const students = await Student.find().sort({ enrolledAt: -1 });
    res.json(students);
  })
);

router.get(
  '/attendance',
  asyncHandler(async (req, res) => {
    const logs = await AttendanceLog.find().sort({ recognizedAt: -1 });
    res.json(logs);
  })
);

router.post(
  '/attendance',
  asyncHandler(async (req, res) => {
    const { usn, name, course, recognizedAt } = req.body;
    if (!usn) return res.status(400).json({ message: 'USN is required' });

    const student = await Student.findOne({ usn: usn.toUpperCase() });
    if (!student && (!name || !course)) {
      return res.status(404).json({
        message: 'Student not found, and insufficient manual data provided',
      });
    }

    await recordDailyAttendance({
      usn: usn.toUpperCase(),
      name: student?.name || name,
      course: student?.course || course,
      recognizedAt,
      method: 'manual',
      studentId: student?._id,
    });

    res.status(200).json({ message: 'Attendance logged successfully' });
  })
);

router.post(
  '/periodwise-attendance',
  asyncHandler(async (req, res) => {
    const { usn, recognizedAt } = req.body;
    if (!usn) return res.status(400).json({ message: 'USN is required' });

    const student = await Student.findOne({ usn: usn.toUpperCase() });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const log = await recordPeriodAttendance({
      usn: student.usn,
      name: student.name,
      course: student.course,
      recognizedAt,
      studentId: student._id,
    });

    res.status(200).json({
      message: `Period-wise attendance recorded for ${log.period}`,
      log,
    });
  })
);

router.get(
  '/periodwise-attendance',
  asyncHandler(async (req, res) => {
    const logs = await PeriodwiseAttendanceLog.find().sort({ recognizedAt: -1 });
    res.json(logs);
  })
);

module.exports = router;
