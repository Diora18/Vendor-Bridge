import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import RoleRoute from '../components/layout/RoleRoute';
import { ROLES } from '../utils/constants';
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import VendorListPage from '../pages/vendors/VendorListPage';
import VendorCreatePage from '../pages/vendors/VendorCreatePage';
import VendorDetailsPage from '../pages/vendors/VendorDetailsPage';
import VendorEditPage from '../pages/vendors/VendorEditPage';
import RFQListPage from '../pages/rfqs/RFQListPage';
import RFQCreatePage from '../pages/rfqs/RFQCreatePage';
import RFQDetailsPage from '../pages/rfqs/RFQDetailsPage';
import RFQEditPage from '../pages/rfqs/RFQEditPage';
import RFQAssignVendorsPage from '../pages/rfqs/RFQAssignVendorsPage';
import QuotationSubmissionPage from '../pages/quotations/QuotationSubmissionPage';
import QuotationDetailsPage from '../pages/quotations/QuotationDetailsPage';
import QuotationComparisonPage from '../pages/quotations/QuotationComparisonPage';
import ApprovalListPage from '../pages/approvals/ApprovalListPage';
import ApprovalDetailsPage from '../pages/approvals/ApprovalDetailsPage';
import ApprovalPrintPage from '../pages/approvals/ApprovalPrintPage';
import PurchaseOrderListPage from '../pages/purchaseOrders/PurchaseOrderListPage';
import PurchaseOrderDetailsPage from '../pages/purchaseOrders/PurchaseOrderDetailsPage';
import InvoiceListPage from '../pages/invoices/InvoiceListPage';
import InvoiceDetailsPage from '../pages/invoices/InvoiceDetailsPage';
import InvoicePrintPage from '../pages/invoices/InvoicePrintPage';
import ActivityLogsPage from '../pages/activity/ActivityLogsPage';
import NotificationsPage from '../pages/activity/NotificationsPage';
import ReportsPage from '../pages/reports/ReportsPage';
import SpendingSummaryPage from '../pages/reports/SpendingSummaryPage';
import VendorPerformancePage from '../pages/reports/VendorPerformancePage';
import UserListPage from '../pages/admin/UserListPage';
import UserCreatePage from '../pages/admin/UserCreatePage';
import UserEditPage from '../pages/admin/UserEditPage';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route element={<RoleRoute roles={[ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER]} />}>
          <Route path="/vendors" element={<VendorListPage />} />
          <Route path="/vendors/new" element={<VendorCreatePage />} />
          <Route path="/vendors/:id" element={<VendorDetailsPage />} />
          <Route path="/vendors/:id/edit" element={<VendorEditPage />} />
          <Route path="/rfqs/new" element={<RFQCreatePage />} />
          <Route path="/rfqs/:id/edit" element={<RFQEditPage />} />
          <Route path="/rfqs/:id/assign-vendors" element={<RFQAssignVendorsPage />} />
        </Route>
        <Route path="/rfqs" element={<RFQListPage />} />
        <Route path="/rfqs/:id" element={<RFQDetailsPage />} />
        <Route element={<RoleRoute roles={[ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER, ROLES.MANAGER]} />}>
          <Route path="/rfqs/:id/compare" element={<QuotationComparisonPage />} />
        </Route>
        <Route path="/vendor/rfqs" element={<RFQListPage />} />
        <Route path="/vendor/rfqs/:id/submit-quotation" element={<QuotationSubmissionPage />} />
        <Route path="/quotations/:id" element={<QuotationDetailsPage />} />
        <Route path="/approvals" element={<ApprovalListPage />} />
        <Route path="/approvals/:id" element={<ApprovalDetailsPage />} />
        <Route path="/approvals/:id/print" element={<ApprovalPrintPage />} />
        <Route path="/purchase-orders" element={<PurchaseOrderListPage />} />
        <Route path="/purchase-orders/:id" element={<PurchaseOrderDetailsPage />} />
        <Route path="/invoices" element={<InvoiceListPage />} />
        <Route path="/invoices/:id" element={<InvoiceDetailsPage />} />
        <Route path="/invoices/:id/print" element={<InvoicePrintPage />} />
        <Route path="/activity-logs" element={<ActivityLogsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/reports/spending" element={<SpendingSummaryPage />} />
        <Route path="/reports/vendor-performance" element={<VendorPerformancePage />} />
        <Route element={<RoleRoute roles={[ROLES.ADMIN]} />}>
          <Route path="/admin/users" element={<UserListPage />} />
          <Route path="/admin/users/new" element={<UserCreatePage />} />
          <Route path="/admin/users/:id/edit" element={<UserEditPage />} />
        </Route>
      </Route>
    </Route>
  </Routes>
);

export default AppRoutes;

