const router = require('express').Router();
const controller = require('../controllers/invoiceController');
const validate = require('../middleware/validateMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { invoiceValidator } = require('../validators/invoiceValidator');
const { ROLES } = require('../utils/constants');

router.use(protect);
router.post('/', allowRoles(ROLES.PROCUREMENT_OFFICER, ROLES.ADMIN), validate(invoiceValidator), controller.createInvoice);
router.get('/', controller.listInvoices);
router.get('/:id', controller.getInvoice);
router.get('/:id/pdf', controller.getInvoicePdf);
router.post('/:id/email', allowRoles(ROLES.PROCUREMENT_OFFICER, ROLES.ADMIN), controller.emailInvoice);

module.exports = router;

