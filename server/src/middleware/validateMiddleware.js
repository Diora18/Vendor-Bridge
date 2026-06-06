const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  const result = schema(req.body);

  if (result.error) {
    throw new ApiError(400, 'Validation failed', result.error);
  }

  req.body = result.value;
  next();
};

module.exports = validate;

