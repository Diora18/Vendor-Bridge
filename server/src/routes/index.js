const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/vendors', require('./vendorRoutes'));
router.use('/vendor-categories', require('./vendorCategoryRoutes'));
router.use('/rfqs', require('./rfqRoutes'));
router.use('/quotations', require('./quotationRoutes'));
router.use('/approvals', require('./approvalRoutes'));
router.use('/purchase-orders', require('./purchaseOrderRoutes'));
router.use('/invoices', require('./invoiceRoutes'));
router.use('/notifications', require('./notificationRoutes'));
router.use('/activity-logs', require('./activityLogRoutes'));
router.use('/reports', require('./reportRoutes'));

module.exports = router;

