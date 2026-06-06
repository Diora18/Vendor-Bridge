module.exports = {
  quotationValidator: (body) => {
    const missing = ['items', 'subtotal', 'totalAmount', 'deliveryTimeline'].filter((field) => body[field] === undefined);
    return missing.length ? { error: { missing }, value: body } : { value: body };
  }
};

