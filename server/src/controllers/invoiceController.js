const Invoice = require('../models/Invoice');
const PurchaseOrder = require('../models/PurchaseOrder');
const Vendor = require('../models/Vendor');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { nextInvoiceNumber } = require('../services/numberGeneratorService');
const { generateInvoicePdf } = require('../services/pdfService');
const { sendEmail } = require('../services/emailService');
const { invoiceEmail } = require('../templates/emailTemplates');
const { createActivityLog } = require('../services/activityLogService');
const { notifyVendorUsers } = require('../services/notificationHelper');
const { ROLES } = require('../utils/constants');

const populateInvoice = (query) => query
  .populate({ path: 'poId', populate: { path: 'rfqId vendorId' } })
  .populate('vendorId createdBy');

const createInvoice = asyncHandler(async (req, res) => {
  const po = await PurchaseOrder.findById(req.body.poId).populate('vendorId rfqId');
  if (!po) throw new ApiError(404, 'Purchase order not found');

  const existingInvoice = await Invoice.findOne({ poId: po._id });
  if (existingInvoice) throw new ApiError(409, 'An invoice already exists for this purchase order');

  const invoice = await Invoice.create({
    invoiceNumber: await nextInvoiceNumber(),
    poId: po._id,
    vendorId: po.vendorId._id || po.vendorId,
    items: po.items,
    subtotal: po.subtotal,
    taxAmount: po.taxAmount,
    totalAmount: po.totalAmount,
    createdBy: req.user._id
  });

  const populated = await populateInvoice(Invoice.findById(invoice._id));
  populated.pdfUrl = await generateInvoicePdf(await populated);
  await populated.save();

  await createActivityLog({
    userId: req.user._id,
    action: 'invoice.generated',
    entityType: 'Invoice',
    entityId: invoice._id,
    message: `Invoice ${invoice.invoiceNumber} generated`
  });
  await notifyVendorUsers([invoice.vendorId], {
    title: 'Invoice generated',
    message: `Invoice ${invoice.invoiceNumber} has been generated for your company.`,
    type: 'invoice',
    entityType: 'Invoice',
    entityId: invoice._id
  });

  res.status(201).json(await populateInvoice(Invoice.findById(invoice._id)));
});

const listInvoices = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.poId) query.poId = req.query.poId;
  if (req.query.status) query.status = req.query.status;
  if (req.user.role === ROLES.VENDOR && req.user.vendorId) {
    query.vendorId = req.user.vendorId;
  }

  const invoices = await populateInvoice(Invoice.find(query)).sort({ createdAt: -1 });
  res.json(invoices);
});

const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await populateInvoice(Invoice.findById(req.params.id));
  if (!invoice) throw new ApiError(404, 'Invoice not found');

  if (req.user.role === ROLES.VENDOR && String(invoice.vendorId._id || invoice.vendorId) !== String(req.user.vendorId)) {
    throw new ApiError(403, 'You are not authorized to view this invoice');
  }

  res.json(invoice);
});

const getInvoicePdf = asyncHandler(async (req, res) => {
  const invoice = await populateInvoice(Invoice.findById(req.params.id));
  if (!invoice) throw new ApiError(404, 'Invoice not found');

  if (!invoice.pdfUrl) {
    invoice.pdfUrl = await generateInvoicePdf(invoice);
    await invoice.save();
  }

  res.json({ pdfUrl: invoice.pdfUrl });
});

const emailInvoice = asyncHandler(async (req, res) => {
  const invoice = await populateInvoice(Invoice.findById(req.params.id));
  if (!invoice) throw new ApiError(404, 'Invoice not found');

  const vendor = invoice.vendorId;
  const recipient = req.body.to || vendor?.email;
  if (!recipient) throw new ApiError(400, 'No recipient email address available');

  if (!invoice.pdfUrl) {
    invoice.pdfUrl = await generateInvoicePdf(invoice);
    await invoice.save();
  }

  const pdfPath = require('path').join(__dirname, '..', invoice.pdfUrl);
  const email = invoiceEmail(invoice);

  try {
    const result = await sendEmail({
      to: recipient,
      ...email,
      attachments: [{
        filename: `${invoice.invoiceNumber}.pdf`,
        path: pdfPath
      }]
    });

    invoice.status = 'emailed';
    invoice.emailSentAt = new Date();
    await invoice.save();

    await createActivityLog({
      userId: req.user._id,
      action: 'invoice.emailed',
      entityType: 'Invoice',
      entityId: invoice._id,
      message: `Invoice ${invoice.invoiceNumber} emailed to ${recipient}`
    });

    res.json({
      invoice,
      email: result,
      message: `Invoice emailed to ${recipient}`
    });
  } catch (err) {
    if (err.code === 'EMAIL_NOT_CONFIGURED') {
      throw new ApiError(503, 'Email is not configured. Add EMAIL_USER and EMAIL_PASS to server/.env');
    }
    throw new ApiError(502, `Failed to send email: ${err.message}`);
  }
});

module.exports = { createInvoice, listInvoices, getInvoice, getInvoicePdf, emailInvoice };
