const router = require('express').Router();
const controller = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { ROLES } = require('../utils/constants');

router.use(protect, allowRoles(ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER, ROLES.MANAGER));
router.get('/overview', controller.procurementOverview);
router.get('/spending-summary', controller.spendingSummary);
router.get('/vendor-performance', controller.vendorPerformance);
router.get('/monthly-trends', controller.monthlyTrends);
router.get('/export', controller.exportReports);

module.exports = router;

