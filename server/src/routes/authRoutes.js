const router = require('express').Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validateMiddleware');
const { protect } = require('../middleware/authMiddleware');
const {
  signupValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator
} = require('../validators/authValidator');

router.post('/signup', validate(signupValidator), authController.signup);
router.post('/login', validate(loginValidator), authController.login);
router.post('/forgot-password', validate(forgotPasswordValidator), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordValidator), authController.resetPassword);
router.get('/me', protect, authController.me);

module.exports = router;

