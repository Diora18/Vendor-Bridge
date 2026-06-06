const router = require('express').Router();
const controller = require('../controllers/rfqController');
const quotationController = require('../controllers/quotationController');
const validate = require('../middleware/validateMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { rfqValidator } = require('../validators/rfqValidator');
const { quotationValidator } = require('../validators/quotationValidator');
const { ROLES } = require('../utils/constants');

router.use(protect);
router.post('/', allowRoles(ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER), upload.array('attachments', 5), validate(rfqValidator), controller.createRFQ);
router.get('/', controller.listRFQs);
router.get('/:id', controller.getRFQ);
router.patch('/:id', allowRoles(ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER), controller.updateRFQ);
router.post('/:id/assign-vendors', allowRoles(ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER), controller.assignVendors);
router.post('/:id/send', allowRoles(ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER), controller.sendRFQ);
router.get('/:id/comparison', allowRoles(ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER, ROLES.MANAGER), controller.getComparison);
router.post('/:rfqId/quotations', allowRoles(ROLES.VENDOR, ROLES.ADMIN), validate(quotationValidator), quotationController.submitQuotation);
router.get('/:rfqId/quotations', quotationController.listRFQQuotations);

module.exports = router;

