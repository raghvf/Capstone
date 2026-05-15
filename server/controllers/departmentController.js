const { Department } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const departments = await Department.find().populate('head');
  res.json(departments);
});

const create = asyncHandler(async (req, res) => {
  const department = await Department.create(req.body);
  res.status(201).json({ message: 'Department created', department });
});

const update = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!department) return res.status(404).json({ message: 'Department not found' });
  res.json({ message: 'Department updated', department });
});

const remove = asyncHandler(async (req, res) => {
  await Department.findByIdAndDelete(req.params.id);
  res.json({ message: 'Department deleted' });
});

module.exports = { list, create, update, remove };
