# VendorBridge

**VendorBridge** is a Procurement & Vendor Management ERP built for the MERN stack. It digitizes the full procurement lifecycle: vendor onboarding, RFQs, quotations, manager approvals, purchase orders, invoices, activity logs, notifications, and analytics reports.

---

## Features

| Module | Capabilities |
|--------|----------------|
| **Authentication** | Login, signup, JWT sessions, role-based access, forgot/reset password |
| **Vendors** | Register vendors, search/filter, auto-create vendor portal accounts |
| **RFQs** | Create RFQs, assign vendors, attachments, send to vendors |
| **Quotations** | Vendors submit quotes; officers compare and request approval |
| **Approvals** | Manager approve/reject with remarks, timeline, printable/PDF summary |
| **Purchase Orders** | Auto-generated PO numbers from approved quotations |
| **Invoices** | Generate from PO, PDF download, print, email to vendor |
| **Activity Logs** | Audit trail of procurement actions |
| **Notifications** | In-app alerts for RFQs, approvals, POs, invoices |
| **Reports** | Spending summary, monthly trends, vendor performance, CSV export |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, React Router, Axios, Recharts |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| Files | Multer (RFQ attachments), PDFKit (invoices & approvals) |
| Email | Nodemailer (Gmail SMTP) |

---

## Project Structure

```txt
Vendor-Bridge/
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── components/     # UI, layout, charts, forms, tables
│       ├── pages/          # Feature pages by module
│       ├── services/       # API clients
│       ├── store/          # Auth state
│       ├── routes/         # React Router config
│       └── utils/          # Helpers, permissions, formatters
├── server/                 # Express API
│   └── src/
│       ├── controllers/    # Route handlers
│       ├── models/         # Mongoose schemas
│       ├── routes/         # API routes
│       ├── services/       # Email, PDF, reports, notifications
│       ├── middleware/     # Auth, roles, validation, uploads
│       ├── seed/           # Demo users & vendors
│       └── uploads/        # RFQ attachments, invoice/approval PDFs
└── docs/                   # API notes, schema, workflow
```

---

## Prerequisites

- **Node.js** 18+ (20+ recommended)
- **MongoDB** running locally or a remote `MONGO_URI`
- **npm**

Optional for email:

- Gmail account with **2-Step Verification** and an **App Password**

---

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo-url>
cd Vendor-Bridge

npm install
npm install --prefix client
npm install --prefix server
```

### 2. Environment files

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Edit `server/.env` — at minimum set `JWT_SECRET` and `MONGO_URI`. For email, add Gmail SMTP settings (see [Email setup](#email-setup-optional)).

Edit `client/.env` if the API is not on the default URL:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Seed demo data

```bash
npm run seed --prefix server
```

This creates demo users, sample vendors, and links vendor portal accounts.

### 4. Run the app

From the project root:

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api |
| Health check | http://localhost:5000/health |

**Run separately (optional):**

```bash
npm run dev:server   # API only
npm run dev:client   # Frontend only
```

**Start API only (production-style):**

```bash
npm run start --prefix server
```

> **Note:** The server loads `server/.env` automatically whether you start from `server/` or `server/src/`.

---

## Demo Accounts

Password for all seeded accounts: **`Password@123`**

| Role | Email | What they do |
|------|-------|----------------|
| Admin | `admin@vendorbridge.local` | Full access, user management |
| Procurement Officer | `procurement_officer@vendorbridge.local` | RFQs, compare quotes, request approval, POs, invoices |
| Manager | `manager@vendorbridge.local` | Approve or reject quotations |
| Vendor (demo) | `vendor@vendorbridge.local` | Linked to Acme Supplies — submit quotations |
| Vendor (by company email) | e.g. `acme@vendorbridge.local` | Portal login for that vendor record |

When you **create a new vendor**, a portal user is auto-created using the vendor’s email with password `Password@123`.

---

## Procurement Workflow

```txt
1. Procurement Officer creates an RFQ
2. Assigns vendors and sends the RFQ
3. Vendors submit quotations
4. Officer compares quotations and requests manager approval
5. Manager approves or rejects
6. Officer generates a Purchase Order
7. Officer generates an Invoice (PDF / print / email)
8. Activity logs and notifications update throughout
```

### Who does what

| Step | Procurement Officer | Manager | Vendor |
|------|---------------------|---------|--------|
| Create & send RFQ | Yes | View | — |
| Submit quotation | — | — | Yes |
| Compare & request approval | Yes | — | — |
| Approve / reject | — | Yes | — |
| Generate PO & invoice | Yes | — | View own POs/invoices |

---

## Email Setup (optional)

To send **invoice emails** and **password reset** links:

1. Enable [2-Step Verification](https://myaccount.google.com/security) on your Google account.
2. Create an [App Password](https://myaccount.google.com/apppasswords) for **Mail**.
3. Add to `server/.env` (use the **16 characters with no spaces**):

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your16charapppassword
EMAIL_FROM="VendorBridge <your.email@gmail.com>"
CLIENT_URL=http://localhost:5173
```

4. Restart the server.

Without SMTP, password reset links are printed in the **server terminal** in development.

---

## API Overview

Base URL: `http://localhost:5000/api`

Protected routes require:

```http
Authorization: Bearer <jwt_token>
```

| Group | Prefix |
|-------|--------|
| Auth | `/api/auth` |
| Dashboard | `/api/dashboard` |
| Users | `/api/users` |
| Vendors | `/api/vendors` |
| RFQs | `/api/rfqs` |
| Quotations | `/api/quotations` |
| Approvals | `/api/approvals` |
| Purchase Orders | `/api/purchase-orders` |
| Invoices | `/api/invoices` |
| Notifications | `/api/notifications` |
| Activity Logs | `/api/activity-logs` |
| Reports | `/api/reports` |

See `docs/api-routes.md` and `MERN_PROJECT_STRUCTURE.md` for the full endpoint list.

---

## User Roles

| Role | Access |
|------|--------|
| **Admin** | Users, vendors, full workflow, reports |
| **Procurement Officer** | Vendors, RFQs, quotations, approvals (request only), POs, invoices, reports |
| **Manager** | Approvals (decide), RFQs (view), reports |
| **Vendor** | Assigned RFQs, submit quotations, view own POs & invoices, notifications |

---

## Troubleshooting

### "Invalid signature" or empty data after config changes

Your browser token was signed with an old `JWT_SECRET`. **Sign out and sign in again**, or clear `vendorbridge_token` from Local Storage. Data in MongoDB is not deleted.

### "Email is not configured"

Set `EMAIL_USER` and `EMAIL_PASS` in `server/.env` and restart the server.

### Port 5000 already in use

```bash
lsof -nP -iTCP:5000 -sTCP:LISTEN
kill <PID>
```

### Vendor cannot submit quotation

- RFQ must be **sent** by the procurement officer.
- Vendor must be **assigned** to the RFQ.
- Log in with the **vendor company email** (or the demo vendor account linked to that company).

### Manager sees no approve button

Only the **assigned manager** can approve. The procurement officer must **request approval** from the Compare Quotations page first.

---

## Build for Production

```bash
npm run build --prefix client
```

Serve the `client/dist` folder with any static host and run the API with `npm run start --prefix server`. Set production `CLIENT_URL`, `MONGO_URI`, and `JWT_SECRET` in `server/.env`.

---

## Documentation

| File | Description |
|------|-------------|
| `docs/workflow.md` | End-to-end procurement flow |
| `docs/api-routes.md` | API route groups |
| `docs/database-schema.md` | MongoDB collections & fields |
| `MERN_PROJECT_STRUCTURE.md` | Folder layout and team conventions |

---

## License

Private / hackathon project — update as needed for your team.
