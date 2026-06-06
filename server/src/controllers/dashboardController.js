const PurchaseOrder = require('../models/PurchaseOrder');
const Invoice = require('../models/Invoice');
const { getDashboardSummary } = require('../services/reportService');
const asyncHandler = require('../utils/asyncHandler');

const summary = asyncHandler(async (req, res) => {
  res.json(await getDashboardSummary());
});

const recentOrders = asyncHandler(async (req, res) => {
  const orders = await PurchaseOrder.find()
    .populate('vendorId', 'companyName name')
    .populate('rfqId', 'title')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
  res.json(orders);
});

const spendingChart = asyncHandler(async (req, res) => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  // Aggregate PO spending by month
  const poSpending = await PurchaseOrder.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        poTotal: { $sum: '$totalAmount' },
        poCount: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Aggregate Invoice spending by month
  const invSpending = await Invoice.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        invTotal: { $sum: '$totalAmount' },
        invCount: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Build the last 6 months labels
  const months = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: `${monthNames[d.getMonth()]} ${d.getFullYear()}` });
  }

  // Merge into a single response
  const poMap = {};
  poSpending.forEach((r) => { poMap[`${r._id.year}-${r._id.month}`] = r; });
  const invMap = {};
  invSpending.forEach((r) => { invMap[`${r._id.year}-${r._id.month}`] = r; });

  const data = months.map((m) => {
    const poKey = `${m.year}-${m.month}`;
    const po = poMap[poKey] || {};
    const inv = invMap[poKey] || {};
    return {
      label: m.label,
      orders: po.poTotal || 0,
      invoices: inv.invTotal || 0,
      orderCount: po.poCount || 0,
      invoiceCount: inv.invCount || 0
    };
  });

  res.json(data);
});

const analytics = asyncHandler(async (req, res) => {
  res.json(await getDashboardSummary());
});

module.exports = { summary, recentOrders, spendingChart, analytics };

