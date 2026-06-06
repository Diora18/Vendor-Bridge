const requireFields = (body, fields) => {
  const missing = fields.filter((field) => !body[field]);
  if (missing.length) return { error: { missing }, value: body };
  return { value: body };
};

module.exports = {
  signupValidator: (body) => requireFields(body, ['name', 'email', 'password']),
  loginValidator: (body) => requireFields(body, ['email', 'password']),
  forgotPasswordValidator: (body) => requireFields(body, ['email']),
  resetPasswordValidator: (body) => requireFields(body, ['token', 'password'])
};

