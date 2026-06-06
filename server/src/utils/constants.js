const ROLES = {
  ADMIN: 'admin',
  PROCUREMENT_OFFICER: 'procurement_officer',
  VENDOR: 'vendor',
  MANAGER: 'manager'
};

module.exports = {
  ROLES,
  RFQ_STATUSES: ['draft', 'sent', 'quotation_received', 'under_review', 'approval_pending', 'approved', 'rejected', 'po_generated'],
  QUOTATION_STATUSES: ['submitted', 'revised', 'selected', 'rejected'],
  APPROVAL_STATUSES: ['pending', 'approved', 'rejected'],
  PO_STATUSES: ['generated', 'sent', 'acknowledged', 'completed', 'cancelled'],
  INVOICE_STATUSES: ['generated', 'emailed', 'paid', 'cancelled']
};

