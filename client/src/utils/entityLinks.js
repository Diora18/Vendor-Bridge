export const getEntityPath = (entityType, entityId) => {
  if (!entityType || !entityId) return null;

  const paths = {
    RFQ: `/rfqs/${entityId}`,
    Quotation: `/quotations/${entityId}`,
    Approval: `/approvals/${entityId}`,
    PurchaseOrder: `/purchase-orders/${entityId}`,
    Invoice: `/invoices/${entityId}`,
    Vendor: `/vendors/${entityId}`
  };

  return paths[entityType] || null;
};
