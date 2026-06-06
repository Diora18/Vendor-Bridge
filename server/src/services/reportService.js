const Invoice = require('../models/Invoice');
const Vendor = require('../models/Vendor');
const RFQ = require('../models/RFQ');
const Approval = require('../models/Approval');
const PurchaseOrder = require('../models/PurchaseOrder');
const Quotation = require('../models/Quotation');

const getSpendingSummary = async () => {
  const byStatus = await Invoice.aggregate([
    { $group: { _id: '$status', total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } }
  ]);

  const totals = await Invoice.aggregate([
    {
      $group: {
        _id: null,
        totalSpent: { $sum: '$totalAmount' },
        invoiceCount: { $sum: 1 },
        avgInvoice: { $avg: '$totalAmount' }
      }
    }
  ]);

  return {
    byStatus: byStatus.map((row) => ({
      status: row._id || 'unknown',
      total: row.total,
      count: row.count
    })),
    totals: totals[0] || { totalSpent: 0, invoiceCount: 0, avgInvoice: 0 }
  };
};

const getMonthlyTrends = async () => {
  const rows = await Invoice.aggregate([
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        total: { $sum: '$totalAmount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  return rows.map((row) => ({
    year: row._id.year,
    month: row._id.month,
    label: `${row._id.year}-${String(row._id.month).padStart(2, '0')}`,
    total: row.total,
    count: row.count
  }));
};

const getVendorPerformance = async () => {
  const vendors = await Vendor.find().select('companyName name category rating status email').lean();
  const [invoiceStats, quotationStats, poStats] = await Promise.all([
    Invoice.aggregate([
      { $group: { _id: '$vendorId', totalSpent: { $sum: '$totalAmount' }, invoiceCount: { $sum: 1 } } }
    ]),
    Quotation.aggregate([
      {
        $group: {
          _id: '$vendorId',
          quotationCount: { $sum: 1 },
          selectedCount: { $sum: { $cond: [{ $eq: ['$status', 'selected'] }, 1, 0] } }
        }
      }
    ]),
    PurchaseOrder.aggregate([
      { $group: { _id: '$vendorId', poCount: { $sum: 1 }, poTotal: { $sum: '$totalAmount' } } }
    ])
  ]);

  const invoiceMap = Object.fromEntries(invoiceStats.map((row) => [String(row._id), row]));
  const quotationMap = Object.fromEntries(quotationStats.map((row) => [String(row._id), row]));
  const poMap = Object.fromEntries(poStats.map((row) => [String(row._id), row]));

  return vendors.map((vendor) => {
    const id = String(vendor._id);
    const invoices = invoiceMap[id] || {};
    const quotations = quotationMap[id] || {};
    const pos = poMap[id] || {};
    const quotationCount = quotations.quotationCount || 0;
    const selectedCount = quotations.selectedCount || 0;

    return {
      ...vendor,
      totalSpent: invoices.totalSpent || 0,
      invoiceCount: invoices.invoiceCount || 0,
      quotationCount,
      selectedCount,
      winRate: quotationCount ? Math.round((selectedCount / quotationCount) * 100) : 0,
      poCount: pos.poCount || 0,
      poTotal: pos.poTotal || 0
    };
  }).sort((a, b) => b.totalSpent - a.totalSpent);
};

const getProcurementOverview = async () => {
  const [
    rfqByStatus,
    approvalByStatus,
    poCount,
    invoiceCount,
    quotationCount,
    spending,
    monthlyTrends
  ] = await Promise.all([
    RFQ.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Approval.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    PurchaseOrder.countDocuments(),
    Invoice.countDocuments(),
    Quotation.countDocuments(),
    getSpendingSummary(),
    getMonthlyTrends()
  ]);

  return {
    rfqByStatus: rfqByStatus.map((row) => ({ status: row._id, count: row.count })),
    approvalByStatus: approvalByStatus.map((row) => ({ status: row._id, count: row.count })),
    poCount,
    invoiceCount,
    quotationCount,
    totalSpent: spending.totals.totalSpent,
    monthlyTrends: monthlyTrends.slice(-6)
  };
};

const getDashboardSummary = async () => {
  const [rfqs, pendingApprovals, invoices, vendors] = await Promise.all([
    RFQ.countDocuments({ status: { $in: ['sent', 'quotation_received', 'under_review', 'approval_pending'] } }),
    Approval.countDocuments({ status: 'pending' }),
    Invoice.countDocuments(),
    Vendor.countDocuments({ status: 'active' })
  ]);

  return { activeRfqs: rfqs, pendingApprovals, invoices, activeVendors: vendors };
};

const toCsv = (headers, rows) => {
  const escape = (value) => {
    const text = value == null ? '' : String(value);
    return text.includes(',') || text.includes('"') || text.includes('\n')
      ? `"${text.replace(/"/g, '""')}"`
      : text;
  };

  const lines = [headers.map(escape).join(',')];
  rows.forEach((row) => lines.push(row.map(escape).join(',')));
  return lines.join('\n');
};

const exportSpendingCsv = async () => {
  const data = await getSpendingSummary();
  const headers = ['Status', 'Invoice count', 'Total amount'];
  const rows = data.byStatus.map((row) => [row.status, row.count, row.total]);
  rows.push(['TOTAL', data.totals.invoiceCount, data.totals.totalSpent]);
  return toCsv(headers, rows);
};

const exportVendorPerformanceCsv = async () => {
  const vendors = await getVendorPerformance();
  const headers = ['Company', 'Category', 'Rating', 'Status', 'Quotations', 'Selected', 'Win rate %', 'POs', 'Invoices', 'Total spent'];
  const rows = vendors.map((vendor) => [
    vendor.companyName,
    vendor.category,
    vendor.rating,
    vendor.status,
    vendor.quotationCount,
    vendor.selectedCount,
    vendor.winRate,
    vendor.poCount,
    vendor.invoiceCount,
    vendor.totalSpent
  ]);
  return toCsv(headers, rows);
};

const exportMonthlyTrendsCsv = async () => {
  const trends = await getMonthlyTrends();
  const headers = ['Month', 'Invoice count', 'Total amount'];
  const rows = trends.map((row) => [row.label, row.count, row.total]);
  return toCsv(headers, rows);
};

module.exports = {
  getSpendingSummary,
  getMonthlyTrends,
  getVendorPerformance,
  getProcurementOverview,
  getDashboardSummary,
  exportSpendingCsv,
  exportVendorPerformanceCsv,
  exportMonthlyTrendsCsv
};
