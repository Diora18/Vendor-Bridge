const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { ROLES } = require('../utils/constants');

const createUser = asyncHandler(async (req, res) => {
  const user = await User.create({ ...req.body, password: req.body.password || 'Password@123' });
  res.status(201).json({ ...user.toObject(), password: undefined });
});

const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
});

const listApprovers = asyncHandler(async (req, res) => {
  const users = await User.find({
    role: { $in: [ROLES.MANAGER, ROLES.ADMIN] },
    status: 'active'
  }).select('name email role').sort({ name: 1 });
  res.json(users);
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) throw new ApiError(404, 'User not found');
  res.json(user);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password');
  if (!user) throw new ApiError(404, 'User not found');
  res.json(user);
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.status(204).send();
});

module.exports = { createUser, listUsers, listApprovers, getUser, updateUser, deleteUser };

