# VendorBridge MERN Project Structure

This file defines the shared folder and file structure for the VendorBridge hackathon project. Everyone should follow this structure so different team members can build separate modules without creating duplicate folders or mismatched naming.

## Root Structure

```txt
Vendor-Bridge/
  README.md
  MERN_PROJECT_STRUCTURE.md

  client/
    package.json
    vite.config.js
    index.html
    .env.example
    src/

  server/
    package.json
    .env.example
    src/

  docs/
    api-routes.md
    database-schema.md
    workflow.md
```

## Client Structure

```txt
client/
  package.json
  vite.config.js
  index.html
  .env.example

  src/
    main.jsx
    App.jsx

    assets/
      images/
      icons/

    components/
      common/
        Button.jsx
        Input.jsx
        Select.jsx
        Textarea.jsx
        Modal.jsx
        ConfirmDialog.jsx
        Badge.jsx
        Loader.jsx
        EmptyState.jsx
        SearchBar.jsx
        Pagination.jsx

      layout/
        AppLayout.jsx
        Sidebar.jsx
        Topbar.jsx
        ProtectedRoute.jsx
        RoleRoute.jsx
        PageHeader.jsx

      forms/
        VendorForm.jsx
        RFQForm.jsx
        QuotationForm.jsx
        ApprovalRemarkForm.jsx
        InvoiceForm.jsx

      tables/
        VendorTable.jsx
        RFQTable.jsx
        QuotationTable.jsx
        ApprovalTable.jsx
        PurchaseOrderTable.jsx
        InvoiceTable.jsx
        ActivityLogTable.jsx

      charts/
        SpendingChart.jsx
        MonthlyTrendChart.jsx
        VendorPerformanceChart.jsx

    pages/
      auth/
        LoginPage.jsx
        SignupPage.jsx
        ForgotPasswordPage.jsx
        ResetPasswordPage.jsx

      dashboard/
        DashboardPage.jsx
        DashboardCards.jsx
        RecentActivity.jsx
        QuickActions.jsx

      vendors/
        VendorListPage.jsx
        VendorCreatePage.jsx
        VendorDetailsPage.jsx
        VendorEditPage.jsx

      rfqs/
        RFQListPage.jsx
        RFQCreatePage.jsx
        RFQDetailsPage.jsx
        RFQEditPage.jsx
        RFQAssignVendorsPage.jsx

      quotations/
        QuotationSubmissionPage.jsx
        QuotationDetailsPage.jsx
        QuotationComparisonPage.jsx

      approvals/
        ApprovalListPage.jsx
        ApprovalDetailsPage.jsx

      purchaseOrders/
        PurchaseOrderListPage.jsx
        PurchaseOrderDetailsPage.jsx

      invoices/
        InvoiceListPage.jsx
        InvoiceDetailsPage.jsx
        InvoicePrintPage.jsx

      activity/
        ActivityLogsPage.jsx
        NotificationsPage.jsx

      reports/
        ReportsPage.jsx
        SpendingSummaryPage.jsx
        VendorPerformancePage.jsx

      admin/
        UserListPage.jsx
        UserCreatePage.jsx
        UserEditPage.jsx

    routes/
      AppRoutes.jsx
      routeConfig.js

    services/
      api.js
      authService.js
      dashboardService.js
      vendorService.js
      rfqService.js
      quotationService.js
      approvalService.js
      purchaseOrderService.js
      invoiceService.js
      notificationService.js
      reportService.js
      userService.js

    store/
      store.js
      authSlice.js
      notificationSlice.js
      dashboardSlice.js

    hooks/
      useAuth.js
      useRole.js
      usePermissions.js
      useDebounce.js
      usePagination.js

    utils/
      constants.js
      permissions.js
      formatCurrency.js
      formatDate.js
      validators.js

    styles/
      index.css
```

## Server Structure

```txt
server/
  package.json
  .env.example

  src/
    server.js
    app.js

    config/
      db.js
      env.js
      cors.js

    models/
      User.js
      Vendor.js
      RFQ.js
      Quotation.js
      Approval.js
      PurchaseOrder.js
      Invoice.js
      ActivityLog.js
      Notification.js
      Counter.js

    controllers/
      authController.js
      dashboardController.js
      vendorController.js
      rfqController.js
      quotationController.js
      approvalController.js
      purchaseOrderController.js
      invoiceController.js
      notificationController.js
      reportController.js
      userController.js

    routes/
      index.js
      authRoutes.js
      dashboardRoutes.js
      vendorRoutes.js
      rfqRoutes.js
      quotationRoutes.js
      approvalRoutes.js
      purchaseOrderRoutes.js
      invoiceRoutes.js
      notificationRoutes.js
      reportRoutes.js
      userRoutes.js

    middleware/
      authMiddleware.js
      roleMiddleware.js
      validateMiddleware.js
      uploadMiddleware.js
      errorMiddleware.js
      notFoundMiddleware.js

    services/
      authService.js
      emailService.js
      pdfService.js
      notificationService.js
      activityLogService.js
      numberGeneratorService.js
      reportService.js

    validators/
      authValidator.js
      vendorValidator.js
      rfqValidator.js
      quotationValidator.js
      approvalValidator.js
      purchaseOrderValidator.js
      invoiceValidator.js
      userValidator.js

    utils/
      ApiError.js
      asyncHandler.js
      constants.js
      generateToken.js
      formatCurrency.js
      buildQuery.js

    templates/
      invoiceTemplate.js
      purchaseOrderTemplate.js
      emailTemplates.js

    uploads/
      rfq-attachments/
      invoice-pdfs/
```

## Page Routes

```txt
/login
/signup
/forgot-password
/reset-password/:token

/dashboard

/vendors
/vendors/new
/vendors/:id
/vendors/:id/edit

/rfqs
/rfqs/new
/rfqs/:id
/rfqs/:id/edit
/rfqs/:id/assign-vendors
/rfqs/:id/compare

/vendor/rfqs
/vendor/rfqs/:id/submit-quotation

/quotations/:id

/approvals
/approvals/:id

/purchase-orders
/purchase-orders/:id

/invoices
/invoices/:id
/invoices/:id/print

/activity-logs
/notifications

/reports
/reports/spending
/reports/vendor-performance

/admin/users
/admin/users/new
/admin/users/:id/edit
```

## API Routes

```txt
Auth
  POST   /api/auth/signup
  POST   /api/auth/login
  POST   /api/auth/forgot-password
  POST   /api/auth/reset-password
  GET    /api/auth/me

Dashboard
  GET    /api/dashboard/summary
  GET    /api/dashboard/recent-activity
  GET    /api/dashboard/analytics

Users
  POST   /api/users
  GET    /api/users
  GET    /api/users/:id
  PATCH  /api/users/:id
  DELETE /api/users/:id

Vendors
  POST   /api/vendors
  GET    /api/vendors
  GET    /api/vendors/:id
  PATCH  /api/vendors/:id
  DELETE /api/vendors/:id

RFQs
  POST   /api/rfqs
  GET    /api/rfqs
  GET    /api/rfqs/:id
  PATCH  /api/rfqs/:id
  POST   /api/rfqs/:id/assign-vendors
  POST   /api/rfqs/:id/send
  GET    /api/rfqs/:id/comparison

Quotations
  POST   /api/rfqs/:rfqId/quotations
  GET    /api/rfqs/:rfqId/quotations
  GET    /api/quotations/:id
  PATCH  /api/quotations/:id
  POST   /api/quotations/:id/select

Approvals
  POST   /api/approvals
  GET    /api/approvals
  GET    /api/approvals/:id
  POST   /api/approvals/:id/approve
  POST   /api/approvals/:id/reject

Purchase Orders
  POST   /api/purchase-orders
  GET    /api/purchase-orders
  GET    /api/purchase-orders/:id
  POST   /api/purchase-orders/:id/send

Invoices
  POST   /api/invoices
  GET    /api/invoices
  GET    /api/invoices/:id
  GET    /api/invoices/:id/pdf
  POST   /api/invoices/:id/email

Notifications
  GET    /api/notifications
  PATCH  /api/notifications/:id/read
  PATCH  /api/notifications/read-all

Activity Logs
  GET    /api/activity-logs

Reports
  GET    /api/reports/spending-summary
  GET    /api/reports/vendor-performance
  GET    /api/reports/monthly-trends
  GET    /api/reports/export
```

## MongoDB Collections

```txt
users
vendors
rfqs
quotations
approvals
purchaseorders
invoices
activitylogs
notifications
counters
```

## Main Model Fields

### User

```txt
name
email
password
role: admin | procurement_officer | vendor | manager
phone
status: active | inactive
vendorId
createdAt
updatedAt
```

### Vendor

```txt
name
companyName
email
phone
category
gstNumber
address
status: active | inactive | blacklisted
rating
createdBy
createdAt
updatedAt
```

### RFQ

```txt
title
description
items[]
attachments[]
deadline
assignedVendors[]
status: draft | sent | quotation_received | under_review | approval_pending | approved | rejected | po_generated
createdBy
createdAt
updatedAt
```

### Quotation

```txt
rfqId
vendorId
items[]
subtotal
taxAmount
totalAmount
deliveryTimeline
notes
status: submitted | revised | selected | rejected
submittedAt
createdAt
updatedAt
```

### Approval

```txt
rfqId
quotationId
requestedBy
approverId
status: pending | approved | rejected
remarks
timeline[]
createdAt
updatedAt
```

### PurchaseOrder

```txt
poNumber
rfqId
quotationId
vendorId
items[]
subtotal
taxAmount
totalAmount
status: generated | sent | acknowledged | completed | cancelled
generatedBy
createdAt
updatedAt
```

### Invoice

```txt
invoiceNumber
poId
vendorId
items[]
subtotal
taxAmount
totalAmount
status: generated | emailed | paid | cancelled
pdfUrl
emailSentAt
createdBy
createdAt
updatedAt
```

### ActivityLog

```txt
userId
action
entityType
entityId
message
metadata
createdAt
```

### Notification

```txt
recipientId
title
message
type
isRead
entityType
entityId
createdAt
```

### Counter

```txt
name
value
prefix
year
```

## Workflow Rules

```txt
1. Procurement Officer creates RFQ.
2. Procurement Officer assigns vendors.
3. Vendors submit quotations.
4. Procurement Officer compares quotations.
5. Procurement Officer selects one quotation.
6. Approval request is created.
7. Manager approves or rejects.
8. If approved, purchase order can be generated.
9. Invoice can be generated only from a purchase order.
10. Invoice can be downloaded, printed, or emailed.
11. Every important action creates activity logs and notifications.
```

## Role Access Matrix

```txt
Admin
  Can manage users.
  Can manage vendors.
  Can view all RFQs, quotations, approvals, POs, invoices, logs, and reports.

Procurement Officer
  Can create RFQs.
  Can assign vendors.
  Can compare quotations.
  Can request approvals.
  Can generate purchase orders.
  Can generate invoices.

Vendor
  Can view assigned RFQs.
  Can submit quotations.
  Can edit quotation before deadline.
  Can view own purchase orders.

Manager / Approver
  Can view pending approvals.
  Can approve or reject procurement requests.
  Can add approval remarks.
  Can monitor workflow status.
```

## Suggested Team Split

```txt
Person 1: Authentication + layout
  client/src/pages/auth
  client/src/components/layout
  client/src/store/authSlice.js
  server/src/controllers/authController.js
  server/src/routes/authRoutes.js
  server/src/middleware/authMiddleware.js

Person 2: Vendor + RFQ management
  client/src/pages/vendors
  client/src/pages/rfqs
  client/src/components/forms/VendorForm.jsx
  client/src/components/forms/RFQForm.jsx
  server/src/controllers/vendorController.js
  server/src/controllers/rfqController.js
  server/src/models/Vendor.js
  server/src/models/RFQ.js

Person 3: Quotations + comparison
  client/src/pages/quotations
  client/src/components/tables/QuotationTable.jsx
  server/src/controllers/quotationController.js
  server/src/models/Quotation.js
  server/src/routes/quotationRoutes.js

Person 4: Approvals + purchase orders
  client/src/pages/approvals
  client/src/pages/purchaseOrders
  server/src/controllers/approvalController.js
  server/src/controllers/purchaseOrderController.js
  server/src/models/Approval.js
  server/src/models/PurchaseOrder.js

Person 5: Invoices + PDF/email + reports
  client/src/pages/invoices
  client/src/pages/reports
  server/src/controllers/invoiceController.js
  server/src/controllers/reportController.js
  server/src/services/pdfService.js
  server/src/services/emailService.js

Person 6: Dashboard + notifications + logs
  client/src/pages/dashboard
  client/src/pages/activity
  server/src/controllers/dashboardController.js
  server/src/controllers/notificationController.js
  server/src/services/activityLogService.js
  server/src/services/notificationService.js
```

## Build Order

```txt
1. Create client and server folders.
2. Set up React routing and Express app.
3. Build authentication and protected routes.
4. Add vendor management.
5. Add RFQ creation and vendor assignment.
6. Add vendor quotation submission.
7. Add quotation comparison.
8. Add approval workflow.
9. Add purchase order generation.
10. Add invoice generation, PDF, print, and email.
11. Add notifications and activity logs.
12. Add dashboard and reports.
```

## Naming Rules

```txt
React components: PascalCase.jsx
Pages: FeatureNamePage.jsx
Services: featureService.js
Controllers: featureController.js
Routes: featureRoutes.js
Models: PascalCase.js
Middleware: purposeMiddleware.js
```

## Important Implementation Rule

Build around the procurement workflow, not separate random CRUD pages. Every module should update the correct status, create activity logs, notify the correct users, and preserve the chain from RFQ to quotation to approval to purchase order to invoice.
