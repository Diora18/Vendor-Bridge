const router = require('express').Router();
const controller = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { ROLES } = require('../utils/constants');

router.get('/approvers', protect, allowRoles(ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER, ROLES.MANAGER), controller.listApprovers);

router.use(protect, allowRoles(ROLES.ADMIN));
router.post('/', controller.createUser);
router.get('/', controller.listUsers);
router.get('/:id', controller.getUser);
router.patch('/:id', controller.updateUser);
router.delete('/:id', controller.deleteUser);

module.exports = router;

