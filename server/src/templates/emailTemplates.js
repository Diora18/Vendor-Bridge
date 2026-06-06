const formatCurrency = require('../utils/formatCurrency');

const invoiceEmail = (invoice) => {
  const vendor = invoice.vendorId || {};
  const po = invoice.poId || {};

  return {
    subject: `Invoice ${invoice.invoiceNumber} from VendorBridge`,
    text: `Invoice ${invoice.invoiceNumber} for ${formatCurrency(invoice.totalAmount)} is attached. PO: ${po.poNumber || '-'}.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #172033; max-width: 600px;">
        <h2 style="color: #1f6fb2;">VendorBridge Invoice</h2>
        <p>Hello ${vendor.companyName || vendor.name || 'Vendor'},</p>
        <p>Please find your invoice attached for the purchase order below.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px 0;"><strong>Invoice number</strong></td><td>${invoice.invoiceNumber}</td></tr>
          <tr><td style="padding: 8px 0;"><strong>Purchase order</strong></td><td>${po.poNumber || '-'}</td></tr>
          <tr><td style="padding: 8px 0;"><strong>Total amount</strong></td><td>${formatCurrency(invoice.totalAmount)}</td></tr>
          <tr><td style="padding: 8px 0;"><strong>Status</strong></td><td>${invoice.status}</td></tr>
        </table>
        <p>If you have questions, reply to this email or contact your procurement officer.</p>
        <p style="color: #65758b; font-size: 12px;">VendorBridge Procurement ERP</p>
      </div>
    `
  };
};

const passwordResetEmail = ({ name, resetUrl }) => ({
  subject: 'Reset your VendorBridge password',
  text: `Reset your password using this link (valid for 1 hour): ${resetUrl}`,
  html: `
    <div style="font-family: Arial, sans-serif; color: #172033; max-width: 600px;">
      <h2 style="color: #1f6fb2;">Password reset</h2>
      <p>Hello ${name || 'there'},</p>
      <p>We received a request to reset your VendorBridge password.</p>
      <p><a href="${resetUrl}" style="display: inline-block; background: #1f6fb2; color: #fff; padding: 12px 18px; border-radius: 6px; text-decoration: none;">Reset password</a></p>
      <p>Or copy this link into your browser:</p>
      <p style="word-break: break-all; color: #1f6fb2;">${resetUrl}</p>
      <p>This link expires in <strong>1 hour</strong>. If you did not request this, you can ignore this email.</p>
      <p style="color: #65758b; font-size: 12px;">VendorBridge Procurement ERP</p>
    </div>
  `
});

module.exports = { invoiceEmail, passwordResetEmail };
