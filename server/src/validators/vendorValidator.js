module.exports = {
  vendorValidator: (body) => {
    const missing = ['name', 'companyName', 'email', 'category'].filter((field) => !body[field]);
    return missing.length ? { error: { missing }, value: body } : { value: body };
  }
};

