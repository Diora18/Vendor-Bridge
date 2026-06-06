const User = require('../models/User');
const { ROLES } = require('../utils/constants');
const { createNotification } = require('./notificationService');

const notifyUser = async (recipientId, payload) => {
  if (!recipientId) return null;
  return createNotification({ recipientId, ...payload });
};

const notifyUsers = async (recipientIds, payload) => {
  const ids = [...new Set((recipientIds || []).filter(Boolean).map(String))];
  return Promise.all(ids.map((id) => notifyUser(id, payload)));
};

const notifyVendorUsers = async (vendorIds, payload) => {
  const ids = [...new Set((vendorIds || []).filter(Boolean).map(String))];
  if (!ids.length) return [];

  const users = await User.find({
    vendorId: { $in: ids },
    role: ROLES.VENDOR,
    status: 'active'
  }).select('_id');

  return notifyUsers(users.map((user) => user._id), payload);
};

module.exports = { notifyUser, notifyUsers, notifyVendorUsers };
