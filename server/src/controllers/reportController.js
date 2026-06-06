const asyncHandler = require('../utils/asyncHandler');
const reportService = require('../services/reportService');

const spendingSummary = asyncHandler(async (req, res) => {
  res.json(await reportService.getSpendingSummary());
});

const vendorPerformance = asyncHandler(async (req, res) => {
  res.json(await reportService.getVendorPerformance());
});

const monthlyTrends = asyncHandler(async (req, res) => {
  res.json(await reportService.getMonthlyTrends());
});

const procurementOverview = asyncHandler(async (req, res) => {
  res.json(await reportService.getProcurementOverview());
});

const exportReports = asyncHandler(async (req, res) => {
  const type = req.query.type || 'spending';
  let csv = '';
  let filename = 'vendorbridge-report.csv';

  if (type === 'vendors') {
    csv = await reportService.exportVendorPerformanceCsv();
    filename = 'vendor-performance.csv';
  } else if (type === 'monthly') {
    csv = await reportService.exportMonthlyTrendsCsv();
    filename = 'monthly-trends.csv';
  } else {
    csv = await reportService.exportSpendingCsv();
    filename = 'spending-summary.csv';
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
});

module.exports = { spendingSummary, vendorPerformance, monthlyTrends, procurementOverview, exportReports };
