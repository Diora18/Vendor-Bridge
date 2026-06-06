# VendorBridge

Procurement and Vendor Management ERP built with the MERN stack.

## Structure

```txt
client/   React frontend
server/   Express + MongoDB backend
docs/     API, schema, and workflow notes
```

## Local Setup

```bash
npm install
npm install --prefix client
npm install --prefix server
cp client/.env.example client/.env
cp server/.env.example server/.env
npm run dev
```

The client runs on `http://localhost:5173`.

The server runs on `http://localhost:5000`.
