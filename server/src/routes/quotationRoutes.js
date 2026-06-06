const router = require('express').Router();
const controller = require('../controllers/quotationController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { ROLES } = require('../utils/constants');

router.use(protect);
router.get('/:id', controller.getQuotation);
router.patch('/:id', allowRoles(ROLES.VENDOR, ROLES.ADMIN), controller.updateQuotation);
router.post('/:id/select', allowRoles(ROLES.PROCUREMENT_OFFICER, ROLES.ADMIN), controller.selectQuotation);

module.exports = router;

