const router = require('express').Router();
const controller = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { ROLES } = require('../utils/constants');

router.use(protect, allowRoles(ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER, ROLES.MANAGER));
router.get('/', controller.listActivityLogs);

module.exports = router;

