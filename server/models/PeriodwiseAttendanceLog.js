const mongoose = require('mongoose');

const periodwiseAttendanceLogSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    usn: { type: String, required: true, index: true },
    name: { type: String, required: true },
    course: String,
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    period: { type: String, required: true },
    subject: String,
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused'],
      default: 'present',
    },
    method: {
      type: String,
      enum: ['face', 'manual', 'correction'],
      default: 'face',
    },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    confidence: Number,
    recognizedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

periodwiseAttendanceLogSchema.index({ usn: 1, period: 1, recognizedAt: -1 });

module.exports = mongoose.model('PeriodwiseAttendanceLog', periodwiseAttendanceLogSchema);
