const Notification = require('../models/Notification');

const createNotification = async ({ recipientId, title, message, type = 'info', entityType, entityId }) => {
  if (!recipientId) return null;
  return Notification.create({ recipientId, title, message, type, entityType, entityId });
};

module.exports = { createNotification };

