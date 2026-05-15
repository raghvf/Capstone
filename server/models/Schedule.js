const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    room: String,
    period: String,
    subject: String,
  },
  { timestamps: true }
);

scheduleSchema.index({ class: 1, dayOfWeek: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);
