const mongoose = require('mongoose');
const { RFQ_STATUSES } = require('../utils/constants');

const rfqItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, default: 'pcs', trim: true }
  },
  { _id: false }
);

const rfqSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    items: [rfqItemSchema],
    attachments: [{ filename: String, path: String, mimetype: String }],
    deadline: { type: Date, required: true },
    assignedVendors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
    status: { type: String, enum: RFQ_STATUSES, default: 'draft' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('RFQ', rfqSchema);

