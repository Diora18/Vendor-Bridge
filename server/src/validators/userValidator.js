module.exports = {
  userValidator: (body) => {
    const missing = ['name', 'email', 'role'].filter((field) => !body[field]);
    return missing.length ? { error: { missing }, value: body } : { value: body };
  }
};

