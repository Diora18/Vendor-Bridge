const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    message: { type: String, required: true },
    metadata: { type: Object }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);

