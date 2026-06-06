const mongoose = require('mongoose');
const { QUOTATION_STATUSES } = require('../utils/constants');

const quotationItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const quotationSchema = new mongoose.Schema(
  {
    rfqId: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    items: [quotationItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    deliveryTimeline: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    status: { type: String, enum: QUOTATION_STATUSES, default: 'submitted' },
    submittedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

quotationSchema.index({ rfqId: 1, vendorId: 1 }, { unique: true });

module.exports = mongoose.model('Quotation', quotationSchema);

