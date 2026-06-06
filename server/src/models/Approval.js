const mongoose = require('mongoose');
const { APPROVAL_STATUSES } = require('../utils/constants');

const timelineSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    remarks: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    at: { type: Date, default: Date.now }
  },
  { _id: false }
);

const approvalSchema = new mongoose.Schema(
  {
    rfqId: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', required: true },
    quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: APPROVAL_STATUSES, default: 'pending' },
    remarks: { type: String, trim: true },
    timeline: [timelineSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Approval', approvalSchema);

