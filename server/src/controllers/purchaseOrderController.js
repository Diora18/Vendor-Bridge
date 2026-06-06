const Approval = require('../models/Approval');
const PurchaseOrder = require('../models/PurchaseOrder');
const RFQ = require('../models/RFQ');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { nextPoNumber } = require('../services/numberGeneratorService');
const { createActivityLog } = require('../services/activityLogService');
const { notifyVendorUsers } = require('../services/notificationHelper');

const createPurchaseOrder = asyncHandler(async (req, res) => {
  const approval = await Approval.findById(req.body.approvalId).populate('quotationId');
  if (!approval) throw new ApiError(404, 'Approval not found');
  if (approval.status !== 'approved') throw new ApiError(400, 'Purchase order can be generated only after approval');

  const existingPo = await PurchaseOrder.findOne({ quotationId: approval.quotationId._id || approval.quotationId });
  if (existingPo) throw new ApiError(409, 'A purchase order already exists for this approved quotation');

  const quotation = approval.quotationId;
  const po = await PurchaseOrder.create({
    poNumber: await nextPoNumber(),
    rfqId: approval.rfqId,
    quotationId: quotation._id,
    vendorId: quotation.vendorId,
    items: quotation.items,
    subtotal: quotation.subtotal,
    taxAmount: quotation.taxAmount,
    totalAmount: quotation.totalAmount,
    generatedBy: req.user._id
  });

  await RFQ.findByIdAndUpdate(approval.rfqId, { status: 'po_generated' });
  await createActivityLog({ userId: req.user._id, action: 'po.generated', entityType: 'PurchaseOrder', entityId: po._id, message: `Purchase order ${po.poNumber} generated` });
  await notifyVendorUsers([po.vendorId], {
    title: 'Purchase order generated',
    message: `Purchase order ${po.poNumber} was created for your company.`,
    type: 'purchase_order',
    entityType: 'PurchaseOrder',
    entityId: po._id
  });
  res.status(201).json(po);
});

const listPurchaseOrders = asyncHandler(async (req, res) => {
  const purchaseOrders = await PurchaseOrder.find().populate('vendorId rfqId quotationId').sort({ createdAt: -1 });
  res.json(purchaseOrders);
});

const getPurchaseOrder = asyncHandler(async (req, res) => {
  const purchaseOrder = await PurchaseOrder.findById(req.params.id).populate('vendorId rfqId quotationId generatedBy');
  if (!purchaseOrder) throw new ApiError(404, 'Purchase order not found');
  res.json(purchaseOrder);
});

const sendPurchaseOrder = asyncHandler(async (req, res) => {
  const purchaseOrder = await PurchaseOrder.findByIdAndUpdate(req.params.id, { status: 'sent' }, { new: true });
  if (!purchaseOrder) throw new ApiError(404, 'Purchase order not found');
  await createActivityLog({ userId: req.user._id, action: 'po.sent', entityType: 'PurchaseOrder', entityId: purchaseOrder._id, message: `Purchase order ${purchaseOrder.poNumber} sent` });
  await notifyVendorUsers([purchaseOrder.vendorId], {
    title: 'Purchase order sent',
    message: `Purchase order ${purchaseOrder.poNumber} has been sent to your company.`,
    type: 'purchase_order',
    entityType: 'PurchaseOrder',
    entityId: purchaseOrder._id
  });
  res.json(purchaseOrder);
});

module.exports = { createPurchaseOrder, listPurchaseOrders, getPurchaseOrder, sendPurchaseOrder };

