const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.split(' ')[1] : null;

  if (!token) {
    throw new ApiError(401, 'Authentication token is required');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Session expired or invalid. Please sign in again.');
    }
    throw err;
  }

  const user = await User.findById(decoded.id).select('-password');

  if (!user || user.status !== 'active') {
    throw new ApiError(401, 'Invalid or inactive user');
  }

  req.user = user;
  next();
});

module.exports = { protect };

