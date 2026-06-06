const router = require('express').Router();
const controller = require('../controllers/vendorCategoryController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { ROLES } = require('../utils/constants');

router.use(protect);
router.get('/', controller.listCategories);
router.post('/', allowRoles(ROLES.ADMIN), controller.createCategory);
router.patch('/:id', allowRoles(ROLES.ADMIN), controller.updateCategory);
router.delete('/:id', allowRoles(ROLES.ADMIN), controller.deleteCategory);

module.exports = router;
