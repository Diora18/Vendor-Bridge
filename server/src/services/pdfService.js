const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const formatCurrency = require('../utils/formatCurrency');

const writePdf = (filepath, buildDoc) => new Promise((resolve, reject) => {
  const stream = fs.createWriteStream(filepath);
  const doc = new PDFDocument({ margin: 50 });

  stream.on('finish', () => resolve(filepath));
  stream.on('error', reject);
  doc.on('error', reject);

  doc.pipe(stream);
  buildDoc(doc);
  doc.end();
});

const generateInvoicePdf = async (invoice) => {
  const outputDir = path.join(__dirname, '../uploads/invoice-pdfs');
  const filename = `${invoice.invoiceNumber}.pdf`;
  const filepath = path.join(outputDir, filename);

  fs.mkdirSync(outputDir, { recursive: true });

  const po = invoice.poId || {};
  const vendor = invoice.vendorId || po.vendorId || {};
  const poNumber = po.poNumber || po._id || '-';

  await writePdf(filepath, (doc) => {
    doc.fontSize(22).text('VendorBridge Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Purchase Order: ${poNumber}`);
    doc.text(`Vendor: ${vendor.companyName || vendor.name || '-'}`);
    doc.text(`Date: ${new Date(invoice.createdAt || Date.now()).toLocaleDateString()}`);
    doc.text(`Status: ${invoice.status || 'generated'}`);
    doc.moveDown();

    doc.fontSize(14).text('Line items');
    (invoice.items || []).forEach((item) => {
      doc.fontSize(12).text(`${item.name} — Qty: ${item.quantity} — Unit: ${formatCurrency(item.unitPrice)} — Total: ${formatCurrency(item.total)}`);
    });

    doc.moveDown();
    doc.text(`Subtotal: ${formatCurrency(invoice.subtotal)}`);
    doc.text(`Tax: ${formatCurrency(invoice.taxAmount)}`);
    doc.text(`Grand Total: ${formatCurrency(invoice.totalAmount)}`);
  });

  return `/uploads/invoice-pdfs/${filename}`;
};

const generateApprovalPdf = (approval) => {
  const outputDir = path.join(__dirname, '../uploads/approval-pdfs');
  const filename = `approval-${approval._id}.pdf`;
  const filepath = path.join(outputDir, filename);

  fs.mkdirSync(outputDir, { recursive: true });

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(fs.createWriteStream(filepath));

  const quotation = approval.quotationId || {};
  const vendor = quotation.vendorId || {};
  const rfq = approval.rfqId || {};

  doc.fontSize(22).text('VendorBridge Approval Summary', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Approval ID: ${approval._id}`);
  doc.text(`Status: ${approval.status}`);
  doc.text(`RFQ: ${rfq.title || '-'}`);
  doc.text(`Vendor: ${vendor.companyName || vendor.name || '-'}`);
  doc.text(`Requested by: ${approval.requestedBy?.name || '-'}`);
  doc.text(`Assigned approver: ${approval.approverId?.name || '-'}`);
  doc.moveDown();

  doc.fontSize(14).text('Quotation summary');
  doc.fontSize(12).text(`Total amount: ${formatCurrency(quotation.totalAmount)}`);
  doc.text(`Delivery timeline: ${quotation.deliveryTimeline || '-'}`);
  doc.text(`Notes: ${quotation.notes || 'None'}`);
  doc.moveDown();

  if (Array.isArray(quotation.items) && quotation.items.length) {
    doc.text('Line items:');
    quotation.items.forEach((item) => {
      doc.text(`- ${item.name}: Qty ${item.quantity} @ ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.total)}`);
    });
    doc.moveDown();
  }

  doc.fontSize(14).text('Approval timeline');
  (approval.timeline || []).forEach((entry) => {
    const actor = entry.userId?.name || 'System';
    doc.fontSize(12).text(`${entry.status} by ${actor}${entry.remarks ? ` — ${entry.remarks}` : ''}`);
  });

  if (approval.remarks) {
    doc.moveDown();
    doc.text(`Final remarks: ${approval.remarks}`);
  }

  doc.end();
  return `/uploads/approval-pdfs/${filename}`;
};

module.exports = { generateInvoicePdf, generateApprovalPdf };
