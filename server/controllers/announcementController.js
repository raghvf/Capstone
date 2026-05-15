const { Announcement } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role !== 'admin') {
    filter.$or = [
      { targetRole: 'all' },
      { targetRole: req.user.role },
      { author: req.user._id },
    ];
  }
  const announcements = await Announcement.find(filter)
    .populate('author', 'username role')
    .populate('class')
    .sort({ isPinned: -1, createdAt: -1 });
  res.json(announcements);
});

const create = asyncHandler(async (req, res) => {
  const announcement = await Announcement.create({
    ...req.body,
    author: req.user._id,
  });
  res.status(201).json({ message: 'Announcement posted', announcement });
});

const update = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
  res.json({ message: 'Announcement updated', announcement });
});

const remove = asyncHandler(async (req, res) => {
  await Announcement.findByIdAndDelete(req.params.id);
  res.json({ message: 'Announcement deleted' });
});

module.exports = { list, create, update, remove };
