const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetRole: {
      type: String,
      enum: ['all', 'admin', 'teacher', 'student'],
      default: 'all',
    },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    isPinned: { type: Boolean, default: false },
    expiresAt: Date,
  },
  { timestamps: true }
);

announcementSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
