const mongoose = require('mongoose');
const { PO_STATUSES } = require('../utils/constants');

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: { type: String, required: true, unique: true },
    rfqId: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', required: true },
    quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    items: [{ name: String, quantity: Number, unitPrice: Number, total: Number }],
    subtotal: { type: Number, required: true, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: PO_STATUSES, default: 'generated' },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);

