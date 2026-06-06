const router = require('express').Router();
const controller = require('../controllers/vendorController');
const validate = require('../middleware/validateMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { vendorValidator } = require('../validators/vendorValidator');
const { ROLES } = require('../utils/constants');

router.use(protect);
router.post('/', allowRoles(ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER), validate(vendorValidator), controller.createVendor);
router.get('/', controller.listVendors);
router.get('/:id', controller.getVendor);
router.patch('/:id', allowRoles(ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER), controller.updateVendor);
router.delete('/:id', allowRoles(ROLES.ADMIN), controller.deleteVendor);

module.exports = router;

