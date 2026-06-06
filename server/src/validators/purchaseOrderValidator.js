module.exports = {
  purchaseOrderValidator: (body) => {
    const missing = ['approvalId'].filter((field) => !body[field]);
    return missing.length ? { error: { missing }, value: body } : { value: body };
  }
};

