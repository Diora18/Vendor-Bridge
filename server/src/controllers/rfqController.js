const RFQ = require('../models/RFQ');
const Quotation = require('../models/Quotation');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { createActivityLog } = require('../services/activityLogService');
const { notifyVendorUsers } = require('../services/notificationHelper');
const { ROLES } = require('../utils/constants');

const createRFQ = asyncHandler(async (req, res) => {
  const attachments = (req.files || []).map((file) => ({
    filename: file.originalname,
    path: file.path,
    mimetype: file.mimetype
  }));
  const items = typeof req.body.items === 'string' ? JSON.parse(req.body.items) : req.body.items;
  const assignedVendors = typeof req.body.assignedVendors === 'string' ? JSON.parse(req.body.assignedVendors) : req.body.assignedVendors;
  const rfq = await RFQ.create({
    ...req.body,
    items,
    assignedVendors,
    attachments,
    createdBy: req.user._id
  });
  await createActivityLog({ userId: req.user._id, action: 'rfq.created', entityType: 'RFQ', entityId: rfq._id, message: `RFQ ${rfq.title} created` });
  res.status(201).json(rfq);
});

const listRFQs = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.status) query.status = req.query.status;
  // If the requester is a vendor, only return RFQs assigned to their vendorId
  if (req.user && req.user.role === ROLES.VENDOR) {
    query.assignedVendors = req.user.vendorId;
  }
  const rfqs = await RFQ.find(query).populate('assignedVendors createdBy').sort({ createdAt: -1 });
  res.json(rfqs);
});

const getRFQ = asyncHandler(async (req, res) => {
  const rfq = await RFQ.findById(req.params.id).populate('assignedVendors createdBy');
  if (!rfq) throw new ApiError(404, 'RFQ not found');
  // Vendor users may only view RFQs they've been assigned to
  if (req.user && req.user.role === ROLES.VENDOR) {
    const assigned = (rfq.assignedVendors || []).map((v) => String(v._id || v));
    if (!assigned.includes(String(req.user.vendorId))) {
      throw new ApiError(403, 'You are not authorized to view this RFQ');
    }
  }
  res.json(rfq);
});

const updateRFQ = asyncHandler(async (req, res) => {
  const rfq = await RFQ.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!rfq) throw new ApiError(404, 'RFQ not found');
  await createActivityLog({ userId: req.user._id, action: 'rfq.updated', entityType: 'RFQ', entityId: rfq._id, message: `RFQ ${rfq.title} updated` });
  res.json(rfq);
});

const assignVendors = asyncHandler(async (req, res) => {
  const rfq = await RFQ.findById(req.params.id);
  if (!rfq) throw new ApiError(404, 'RFQ not found');

  rfq.assignedVendors = req.body.vendorIds || [];
  await rfq.save();
  await createActivityLog({ userId: req.user._id, action: 'rfq.vendors_assigned', entityType: 'RFQ', entityId: rfq._id, message: `Vendors assigned to RFQ ${rfq.title}` });
  res.json(rfq);
});

const sendRFQ = asyncHandler(async (req, res) => {
  const rfq = await RFQ.findByIdAndUpdate(req.params.id, { status: 'sent' }, { new: true });
  if (!rfq) throw new ApiError(404, 'RFQ not found');
  await createActivityLog({ userId: req.user._id, action: 'rfq.sent', entityType: 'RFQ', entityId: rfq._id, message: `RFQ ${rfq.title} sent to vendors` });
  await notifyVendorUsers(rfq.assignedVendors, {
    title: 'RFQ sent to you',
    message: `RFQ "${rfq.title}" is ready for quotation submission.`,
    type: 'rfq',
    entityType: 'RFQ',
    entityId: rfq._id
  });
  res.json(rfq);
});

const getComparison = asyncHandler(async (req, res) => {
  const quotations = await Quotation.find({ rfqId: req.params.id }).populate('vendorId');
  const lowest = quotations.reduce((best, current) => (!best || current.totalAmount < best.totalAmount ? current : best), null);

  res.json({
    quotations,
    lowestPriceQuotationId: lowest?._id || null,
    fastestDeliveryQuotationId: null,
    recommendedQuotationId: lowest?._id || null
  });
});

module.exports = { createRFQ, listRFQs, getRFQ, updateRFQ, assignVendors, sendRFQ, getComparison };

