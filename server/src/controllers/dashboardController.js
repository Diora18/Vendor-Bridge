const ActivityLog = require('../models/ActivityLog');
const { getDashboardSummary } = require('../services/reportService');
const asyncHandler = require('../utils/asyncHandler');

const summary = asyncHandler(async (req, res) => {
  res.json(await getDashboardSummary());
});

const recentActivity = asyncHandler(async (req, res) => {
  const logs = await ActivityLog.find().populate('userId').sort({ createdAt: -1 }).limit(10);
  res.json(logs);
});

const analytics = asyncHandler(async (req, res) => {
  res.json(await getDashboardSummary());
});

module.exports = { summary, recentActivity, analytics };

