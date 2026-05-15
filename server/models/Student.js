const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    usn: { type: String, required: true, unique: true, uppercase: true, trim: true },
    age: String,
    course: { type: String, required: true },
    phone: String,
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    enrollmentApproved: { type: Boolean, default: false },
    faceEnrolled: { type: Boolean, default: false },
    enrolledAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

studentSchema.index({ usn: 1 });
studentSchema.index({ user: 1 });

module.exports = mongoose.model('Student', studentSchema);
