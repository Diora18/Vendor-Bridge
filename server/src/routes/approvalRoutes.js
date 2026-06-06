const router = require('express').Router();
const controller = require('../controllers/approvalController');
const validate = require('../middleware/validateMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { approvalValidator } = require('../validators/approvalValidator');
const { ROLES } = require('../utils/constants');

router.use(protect);
router.post('/', allowRoles(ROLES.PROCUREMENT_OFFICER, ROLES.ADMIN), validate(approvalValidator), controller.createApproval);
router.get('/', controller.listApprovals);
router.get('/:id', controller.getApproval);
router.get('/:id/pdf', controller.getApprovalPdf);
router.post('/:id/approve', allowRoles(ROLES.MANAGER, ROLES.ADMIN), controller.approve);
router.post('/:id/reject', allowRoles(ROLES.MANAGER, ROLES.ADMIN), controller.reject);

module.exports = router;

