const router = require('express').Router();
const controller = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/summary', controller.summary);
router.get('/recent-activity', controller.recentActivity);
router.get('/analytics', controller.analytics);

module.exports = router;

