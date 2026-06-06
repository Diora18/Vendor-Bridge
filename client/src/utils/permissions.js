import { ROLES } from './constants';

export const canAccess = (user, allowedRoles = []) => {
  if (!allowedRoles.length) return true;
  return Boolean(user && allowedRoles.includes(user.role));
};

export const navigationItems = [
  { label: 'Dashboard', path: '/dashboard', roles: [] },
  { label: 'Vendors', path: '/vendors', roles: [ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER] },
  { label: 'RFQs', path: '/rfqs', roles: [ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER, ROLES.MANAGER] },
  { label: 'Vendor RFQs', path: '/vendor/rfqs', roles: [ROLES.VENDOR] },
  { label: 'Approvals', path: '/approvals', roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.PROCUREMENT_OFFICER] },
  { label: 'Purchase Orders', path: '/purchase-orders', roles: [] },
  { label: 'Invoices', path: '/invoices', roles: [] },
  { label: 'Notifications', path: '/notifications', roles: [] },
  { label: 'Activity Logs', path: '/activity-logs', roles: [ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER, ROLES.MANAGER] },
  { label: 'Reports', path: '/reports', roles: [ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER, ROLES.MANAGER] },
  { label: 'Users', path: '/admin/users', roles: [ROLES.ADMIN] }
];

