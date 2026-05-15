const mongoose = require('mongoose');

const attendanceCorrectionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    usn: { type: String, required: true },
    date: { type: Date, required: true },
    period: String,
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewNote: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('AttendanceCorrection', attendanceCorrectionSchema);
