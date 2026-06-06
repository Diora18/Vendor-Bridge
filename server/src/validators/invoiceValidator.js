module.exports = {
  invoiceValidator: (body) => {
    const missing = ['poId'].filter((field) => !body[field]);
    return missing.length ? { error: { missing }, value: body } : { value: body };
  }
};

