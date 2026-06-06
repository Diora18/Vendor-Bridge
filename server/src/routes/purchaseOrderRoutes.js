const router = require('express').Router();
const controller = require('../controllers/purchaseOrderController');
const validate = require('../middleware/validateMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { purchaseOrderValidator } = require('../validators/purchaseOrderValidator');
const { ROLES } = require('../utils/constants');

router.use(protect);
router.post('/', allowRoles(ROLES.PROCUREMENT_OFFICER, ROLES.ADMIN), validate(purchaseOrderValidator), controller.createPurchaseOrder);
router.get('/', controller.listPurchaseOrders);
router.get('/:id', controller.getPurchaseOrder);
router.post('/:id/send', allowRoles(ROLES.PROCUREMENT_OFFICER, ROLES.ADMIN), controller.sendPurchaseOrder);

module.exports = router;

