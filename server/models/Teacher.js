const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    employeeId: { type: String, required: true, unique: true, trim: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    assignedClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    phone: String,
  },
  { timestamps: true }
);

teacherSchema.index({ employeeId: 1 });
teacherSchema.index({ user: 1 });

module.exports = mongoose.model('Teacher', teacherSchema);
