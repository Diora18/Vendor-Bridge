module.exports = {
  approvalValidator: (body) => {
    const missing = ['rfqId', 'quotationId', 'approverId'].filter((field) => !body[field]);
    return missing.length ? { error: { missing }, value: body } : { value: body };
  }
};

