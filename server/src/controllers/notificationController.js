const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { ROLES } = require('../utils/constants');

const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipientId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(100);
  const unreadCount = await Notification.countDocuments({ recipientId: req.user._id, isRead: false });

  res.json({ notifications, unreadCount });
});

const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipientId: req.user._id },
    { isRead: true },
    { new: true }
  );
  res.json(notification);
});

const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipientId: req.user._id }, { isRead: true });
  res.json({ message: 'Notifications marked as read' });
});

const listActivityLogs = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.entityType) query.entityType = req.query.entityType;
  if (req.query.action) query.action = req.query.action;

  const limit = Math.min(Number(req.query.limit) || 100, 200);
  const logs = await ActivityLog.find(query)
    .populate('userId', 'name email role')
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json(logs);
});

module.exports = { listNotifications, markRead, markAllRead, listActivityLogs };
