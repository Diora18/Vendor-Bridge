const mongoose = require('mongoose');
const { INVOICE_STATUSES } = require('../utils/constants');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    poId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    items: [{ name: String, quantity: Number, unitPrice: Number, total: Number }],
    subtotal: { type: Number, required: true, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: INVOICE_STATUSES, default: 'generated' },
    pdfUrl: { type: String },
    emailSentAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Invoice', invoiceSchema);

