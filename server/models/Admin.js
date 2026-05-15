const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true, trim: true },
    permissions: {
      manageUsers: { type: Boolean, default: true },
      manageDepartments: { type: Boolean, default: true },
      exportReports: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', adminSchema);
