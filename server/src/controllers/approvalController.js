const Approval = require('../models/Approval');
const Quotation = require('../models/Quotation');
const RFQ = require('../models/RFQ');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { createActivityLog } = require('../services/activityLogService');
const { notifyUser } = require('../services/notificationHelper');
const { generateApprovalPdf } = require('../services/pdfService');
const { ROLES } = require('../utils/constants');

const populateApproval = (query) => query
  .populate('rfqId requestedBy approverId')
  .populate({ path: 'quotationId', populate: { path: 'vendorId' } })
  .populate({ path: 'timeline.userId', select: 'name email role' });

const assertCanDecide = (approval, user) => {
  if (approval.status !== 'pending') {
    throw new ApiError(400, 'This approval has already been decided');
  }
  const isApprover = String(approval.approverId) === String(user._id);
  const isAdmin = user.role === ROLES.ADMIN;
  if (!isApprover && !isAdmin) {
    throw new ApiError(403, 'Only the assigned approver or an admin can approve or reject this request');
  }
};

const createApproval = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findById(req.body.quotationId);
  if (!quotation) throw new ApiError(404, 'Quotation not found');
  if (String(quotation.rfqId) !== String(req.body.rfqId)) {
    throw new ApiError(400, 'Quotation does not belong to this RFQ');
  }

  const existing = await Approval.findOne({ rfqId: req.body.rfqId, status: 'pending' });
  if (existing) throw new ApiError(409, 'An approval request is already pending for this RFQ');

  await Quotation.updateMany({ rfqId: req.body.rfqId, _id: { $ne: quotation._id } }, { status: 'rejected' });
  quotation.status = 'selected';
  await quotation.save();

  const approval = await Approval.create({
    ...req.body,
    requestedBy: req.user._id,
    status: 'pending',
    timeline: [{ status: 'pending', remarks: 'Approval requested', userId: req.user._id }]
  });

  await RFQ.findByIdAndUpdate(req.body.rfqId, { status: 'approval_pending' });
  await createActivityLog({
    userId: req.user._id,
    action: 'approval.requested',
    entityType: 'Approval',
    entityId: approval._id,
    message: `Approval requested for RFQ quotation`
  });
  const rfq = await RFQ.findById(req.body.rfqId).select('title');
  await notifyUser(req.body.approverId, {
    title: 'Approval requested',
    message: `Procurement requested your approval for RFQ "${rfq?.title || 'quotation'}".`,
    type: 'approval',
    entityType: 'Approval',
    entityId: approval._id
  });

  const populated = await populateApproval(Approval.findById(approval._id));
  res.status(201).json(await populated);
});

const listApprovals = asyncHandler(async (req, res) => {
  const query = {};
  if (req.user.role === ROLES.MANAGER) {
    query.approverId = req.user._id;
  }
  if (req.query.status) query.status = req.query.status;

  const approvals = await populateApproval(Approval.find(query)).sort({ createdAt: -1 });
  res.json(approvals);
});

const getApproval = asyncHandler(async (req, res) => {
  const approval = await populateApproval(Approval.findById(req.params.id));
  if (!approval) throw new ApiError(404, 'Approval not found');
  res.json(approval);
});

const getApprovalPdf = asyncHandler(async (req, res) => {
  const approval = await populateApproval(Approval.findById(req.params.id));
  if (!approval) throw new ApiError(404, 'Approval not found');

  const pdfUrl = generateApprovalPdf(approval);
  res.json({ pdfUrl });
});

const approve = asyncHandler(async (req, res) => {
  const approval = await Approval.findById(req.params.id);
  if (!approval) throw new ApiError(404, 'Approval not found');

  assertCanDecide(approval, req.user);

  approval.status = 'approved';
  approval.remarks = req.body.remarks;
  approval.timeline.push({ status: 'approved', remarks: req.body.remarks || 'Approved', userId: req.user._id });
  await approval.save();
  await RFQ.findByIdAndUpdate(approval.rfqId, { status: 'approved' });

  await createActivityLog({
    userId: req.user._id,
    action: 'approval.approved',
    entityType: 'Approval',
    entityId: approval._id,
    message: 'Approval approved'
  });
  await notifyUser(approval.requestedBy, {
    title: 'Quotation approved',
    message: 'Your approval request was approved. You can now generate a purchase order.',
    type: 'approval',
    entityType: 'Approval',
    entityId: approval._id
  });

  const populated = await populateApproval(Approval.findById(approval._id));
  res.json(await populated);
});

const reject = asyncHandler(async (req, res) => {
  const approval = await Approval.findById(req.params.id);
  if (!approval) throw new ApiError(404, 'Approval not found');

  assertCanDecide(approval, req.user);

  approval.status = 'rejected';
  approval.remarks = req.body.remarks;
  approval.timeline.push({ status: 'rejected', remarks: req.body.remarks || 'Rejected', userId: req.user._id });
  await approval.save();
  await RFQ.findByIdAndUpdate(approval.rfqId, { status: 'rejected' });

  await createActivityLog({
    userId: req.user._id,
    action: 'approval.rejected',
    entityType: 'Approval',
    entityId: approval._id,
    message: 'Approval rejected'
  });
  await notifyUser(approval.requestedBy, {
    title: 'Quotation rejected',
    message: req.body.remarks || 'Your approval request was rejected.',
    type: 'approval',
    entityType: 'Approval',
    entityId: approval._id
  });

  const populated = await populateApproval(Approval.findById(approval._id));
  res.json(await populated);
});

module.exports = { createApproval, listApprovals, getApproval, getApprovalPdf, approve, reject };
