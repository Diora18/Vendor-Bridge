const RFQ = require('../models/RFQ');
const Quotation = require('../models/Quotation');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { createActivityLog } = require('../services/activityLogService');
const { notifyUser } = require('../services/notificationHelper');

const submitQuotation = asyncHandler(async (req, res) => {
  const rfq = await RFQ.findById(req.params.rfqId);
  if (!rfq) throw new ApiError(404, 'RFQ not found');

  const vendorId = req.user.vendorId || req.body.vendorId;
  if (!vendorId) {
    throw new ApiError(400, 'Your vendor account is not linked to a vendor record. Sign in with the vendor portal email for the assigned company.');
  }

  if (!['sent', 'quotation_received'].includes(rfq.status)) {
    throw new ApiError(400, 'Quotations can only be submitted after the RFQ has been sent to vendors');
  }

  if (Array.isArray(rfq.assignedVendors) && rfq.assignedVendors.length) {
    const assigned = rfq.assignedVendors.map((v) => v.toString());
    if (!assigned.includes(String(vendorId))) {
      throw new ApiError(403, 'You are not assigned to this RFQ. Sign in with the portal account for the vendor that was assigned.');
    }
  }

  const existing = await Quotation.findOne({ rfqId: rfq._id, vendorId });
  if (existing) {
    throw new ApiError(409, 'You have already submitted a quotation for this RFQ');
  }

  const quotation = await Quotation.create({ ...req.body, rfqId: rfq._id, vendorId });
  rfq.status = 'quotation_received';
  await rfq.save();

  await createActivityLog({ userId: req.user._id, action: 'quotation.submitted', entityType: 'Quotation', entityId: quotation._id, message: `Quotation submitted for ${rfq.title}` });
  await notifyUser(rfq.createdBy, {
    title: 'Quotation received',
    message: `A vendor submitted a quotation for RFQ "${rfq.title}".`,
    type: 'quotation',
    entityType: 'RFQ',
    entityId: rfq._id
  });
  res.status(201).json(quotation);
});

const listRFQQuotations = asyncHandler(async (req, res) => {
  const quotations = await Quotation.find({ rfqId: req.params.rfqId }).populate('vendorId');
  res.json(quotations);
});

const getQuotation = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findById(req.params.id).populate('vendorId rfqId');
  if (!quotation) throw new ApiError(404, 'Quotation not found');
  res.json(quotation);
});

const updateQuotation = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findByIdAndUpdate(req.params.id, { ...req.body, status: 'revised' }, { new: true, runValidators: true });
  if (!quotation) throw new ApiError(404, 'Quotation not found');
  await createActivityLog({ userId: req.user._id, action: 'quotation.updated', entityType: 'Quotation', entityId: quotation._id, message: 'Quotation updated' });
  res.json(quotation);
});

const selectQuotation = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findById(req.params.id);
  if (!quotation) throw new ApiError(404, 'Quotation not found');

  await Quotation.updateMany({ rfqId: quotation.rfqId }, { status: 'rejected' });
  quotation.status = 'selected';
  await quotation.save();
  await RFQ.findByIdAndUpdate(quotation.rfqId, { status: 'approval_pending' });

  await createActivityLog({ userId: req.user._id, action: 'quotation.selected', entityType: 'Quotation', entityId: quotation._id, message: 'Quotation selected for approval' });
  res.json(quotation);
});

module.exports = { submitQuotation, listRFQQuotations, getQuotation, updateQuotation, selectQuotation };

