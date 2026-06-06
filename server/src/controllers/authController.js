const crypto = require('crypto');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const env = require('../config/env');
const { sendEmail, isEmailConfigured } = require('../services/emailService');
const { passwordResetEmail } = require('../templates/emailTemplates');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const signup = asyncHandler(async (req, res) => {
  const existing = await User.findOne({ email: req.body.email });
  if (existing) throw new ApiError(409, 'Email is already registered');

  const user = await User.create(req.body);
  const token = generateToken(user);

  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
});

const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await user.comparePassword(req.body.password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(user);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, vendorId: user.vendorId }
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (user) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = hashToken(resetToken);
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${env.clientUrl}/reset-password/${resetToken}`;
    const email = passwordResetEmail({ name: user.name, resetUrl });

    if (isEmailConfigured()) {
      await sendEmail({ to: user.email, ...email });
    } else if (env.nodeEnv === 'development') {
      console.log('\n[password-reset] Email not configured. Use this link:\n', resetUrl, '\n');
    } else {
      throw new ApiError(503, 'Email service is not configured. Contact an administrator.');
    }
  }

  res.json({
    message: 'If an account exists for that email, password reset instructions have been sent.'
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = hashToken(req.body.token);
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  }).select('+resetPasswordToken +resetPasswordExpires +password');

  if (!user) throw new ApiError(400, 'Password reset link is invalid or has expired');

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: 'Password has been reset successfully. You can now sign in.' });
});

module.exports = { signup, login, me, forgotPassword, resetPassword };
