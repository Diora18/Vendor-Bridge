const Counter = require('../models/Counter');

const nextNumber = async (name, prefix) => {
  const year = new Date().getFullYear();
  const counter = await Counter.findOneAndUpdate(
    { name, year },
    { $inc: { value: 1 }, $setOnInsert: { prefix, year } },
    { upsert: true, new: true }
  );

  return `${prefix}-${year}-${String(counter.value).padStart(4, '0')}`;
};

module.exports = {
  nextPoNumber: () => nextNumber('purchase_order', 'PO'),
  nextInvoiceNumber: () => nextNumber('invoice', 'INV')
};

