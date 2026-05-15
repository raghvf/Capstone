const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    subject: { type: String, required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    semester: String,
    academicYear: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

classSchema.index({ teacher: 1 });
classSchema.index({ department: 1 });

module.exports = mongoose.model('Class', classSchema);
