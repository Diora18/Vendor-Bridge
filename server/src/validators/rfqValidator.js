module.exports = {
  rfqValidator: (body) => {
    const missing = ['title', 'deadline'].filter((field) => !body[field]);
    return missing.length ? { error: { missing }, value: body } : { value: body };
  }
};

