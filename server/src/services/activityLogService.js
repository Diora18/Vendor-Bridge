const ActivityLog = require('../models/ActivityLog');

const createActivityLog = async ({ userId, action, entityType, entityId, message, metadata }) => {
  return ActivityLog.create({ userId, action, entityType, entityId, message, metadata });
};

module.exports = { createActivityLog };

