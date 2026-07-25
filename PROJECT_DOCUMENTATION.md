# 📘 EkamuthuERP - Project Documentation & Handover Guide
> **Cloud-Based Community Mutual Aid & Death Donation Society Management System**

---

## 📌 1. Project Overview

**EkamuthuERP** is a full-stack Enterprise Resource Planning (ERP) application developed specifically for Community Mutual Aid Societies (Death Donation Societies). It automates member registrations, monthly subscription tracking, overdue fine calculations, payment receipt management, death benefit claim processing, and PDF financial report generation.

This document serves as the master technical handoff guide for developers maintaining or expanding this codebase.

> [!NOTE]
> AI-assisted development tooling was used during the building, debugging, and documentation phases of this project. All code has been reviewed and verified for correctness.

---

## 🛠️ 2. Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js (v5)
- **Database**: MongoDB with Mongoose ODM (v9)
- **DNS Failover**: Custom Google DNS resolver (`8.8.8.8`) to bypass ISP SRV record restrictions
- **Authentication**: JSON Web Tokens (JWT) & `bcryptjs` password hashing
- **File Uploads**: `multer` with custom storage engine (Stores payment receipts in `uploads/receipts/`)
- **CORS**: Enabled via `cors` middleware

### Frontend
- **Framework**: React.js (v19) built with Vite (v8)
- **Styling**: Tailwind CSS (v4)
- **Icons**: `lucide-react`
- **Routing**: `react-router-dom` (v7)
- **HTTP Client**: Axios with custom request interceptors for automatic JWT injection
- **PDF Generation**: `jspdf` & `jspdf-autotable` (Receipts & Financial Summary Reports)

---

## 📁 3. Directory Structure

```
ekamuthu-erp/
├── backend/
│   ├── config/
│   │   └── db.js                   # MongoDB database connection & Google DNS resolver
│   ├── controllers/
│   │   ├── authController.js       # User registration & login logic with JWT generation
│   │   ├── memberController.js     # Member directory listing & user profile retrieval
│   │   ├── paymentController.js    # Payment recording, member self-service payments,
│   │   │                           #   receipt uploads & payment status management
│   │   └── claimController.js      # Death benefit claim submission & status workflow
│   ├── middleware/
│   │   └── authMiddleware.js       # JWT verification (protect) & role authorization (authorize)
│   ├── models/
│   │   ├── User.js                 # Schema: Members & Admins (with dependents & roles)
│   │   ├── Payment.js              # Schema: Subscriptions, Fines, Receipts & Approval Status
│   │   └── Claim.js                # Schema: Death Benefit Claims
│   ├── routes/
│   │   ├── authRoutes.js           # POST /api/auth/register, POST /api/auth/login
│   │   ├── memberRoutes.js         # GET /api/members, GET /api/members/profile
│   │   ├── paymentRoutes.js        # GET/POST /api/payments, member self-service routes,
│   │   │                           #   multer upload config & payment status updates
│   │   └── claimRoutes.js          # POST/GET /api/claims, PUT /api/claims/:id/status
│   ├── uploads/
│   │   └── receipts/               # Physical directory storing uploaded payment receipt files
│   ├── .env                        # Environment variables (PORT, MONGO_URI, JWT_SECRET)
│   ├── package.json
│   └── server.js                   # Main API server entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── MemberPaymentModal.jsx  # Member self-service payment form with receipt upload
│   │   ├── pages/
│   │   │   ├── Login.jsx           # User login screen with NIC & Password authentication
│   │   │   ├── Dashboard.jsx       # Main layout with sidebar navigation & stats overview
│   │   │   ├── Members.jsx         # Member list table & "Add New Member" registration modal
│   │   │   ├── Payments.jsx        # Payments table, multi-month selector, fine calculator,
│   │   │   │                       #   receipt uploader, status badges & PDF export
│   │   │   └── Claims.jsx          # Benefit claims table, claim request form,
│   │   │                           #   approval & rejection workflow
│   │   ├── utils/
│   │   │   └── generatePDF.js      # Receipt & Financial Report PDF generator using jsPDF
│   │   ├── api.js                  # Axios instance with JWT headers & member payment API helpers
│   │   ├── App.jsx                 # React router setup & ProtectedRoute wrapper
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx                # Application root renderer
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── README.md                       # Quick start & repository overview
└── PROJECT_DOCUMENTATION.md        # This file — master project documentation
```

---

## 🗄️ 4. Database Models & Schemas

### A. User Model (`User.js`)
Stores member directory data, access credentials, and society roles.

| Field | Type | Description |
| :--- | :--- | :--- |
| `membershipNo` | String | Unique auto-generated ID (e.g. `MEM-0001`) |
| `fullName` | String | Member's full name (Required) |
| `nic` | String | National Identity Card number (Unique, Required) |
| `phone` | String | Phone contact number (Required) |
| `address` | String | Residential address (Required) |
| `password` | String | Hashed password via bcrypt (Required) |
| `role` | String | `'Admin'`, `'Treasurer'`, or `'Member'` (Default: `'Member'`) |
| `status` | String | `'Active'`, `'Suspended'`, or `'Deceased'` (Default: `'Active'`) |
| `dependents` | Array | Objects containing `name`, `relationship`, `nicOrBc` |
| `timestamps` | Boolean | Tracks `createdAt` and `updatedAt` |

### B. Payment Model (`Payment.js`)
Tracks monthly subscription collections, fine assessments, uploaded payment receipts, and payment approval status.

| Field | Type | Description |
| :--- | :--- | :--- |
| `member` | ObjectId | Refers to `User` model (Required) |
| `amount` | Number | Amount paid in LKR (Required) |
| `paymentType` | String | `'Monthly Subscription'`, `'Fine'`, `'Admission Fee'`, etc. (Required) |
| `monthYear` | String | Target month string (e.g., `"2026-07"`) |
| `paymentMethod` | String | `'Cash'`, `'Bank Transfer'`, etc. (Default: `'Cash'`) |
| `remarks` | String | Auto-generated or custom payment notes |
| `description` | String | Optional extended payment description |
| `receiptNo` | String | Auto-generated unique receipt code (e.g. `REC-1721758923-4821`) |
| `receiptUrl` | String | Full URL of attached receipt image/PDF (Default: `null`) |
| `recordedBy` | ObjectId | Refers to `User` (Treasurer/Admin who recorded payment) |
| `status` | String | `'Pending'`, `'Approved'`, or `'Rejected'` (Default: `'Approved'`) |
| `timestamps` | Boolean | Tracks payment creation timestamp |

### C. Claim Model (`Claim.js`)
Tracks death benefit claim requests and administrative status decisions.

| Field | Type | Description |
| :--- | :--- | :--- |
| `member` | ObjectId | Refers to requesting `User` (Required) |
| `deceasedName` | String | Name of the deceased individual (Required) |
| `relationship` | String | `'Self'`, `'Spouse'`, `'Child'`, `'Parent'`, etc. (Required) |
| `claimAmount` | Number | Requested benefit sum in LKR (Required) |
| `status` | String | `'Pending'`, `'Approved'`, `'Rejected'`, or `'Paid'` (Default: `'Pending'`) |
| `deathCertificateNo` | String | Death certificate reference number (Required) |
| `approvedBy` | ObjectId | Refers to approving Admin/Treasurer |
| `remarks` | String | Administrative review notes or rejection reasons |
| `timestamps` | Boolean | Tracks claim submission and status updates |

---

## 📡 5. API Endpoints Reference

### 🔑 Authentication Routes (`/api/auth`)
- **`POST /api/auth/register`**
  - **Access**: Public / Admin
  - **Body**: `{ fullName, nic, phone, address, password, role, dependents }`
  - **Function**: Registers a new member, auto-generates `membershipNo` (`MEM-0001`, `MEM-0002`...), hashes password, and returns user object & JWT token.
- **`POST /api/auth/login`**
  - **Access**: Public
  - **Body**: `{ nic, password }`
  - **Function**: Authenticates credentials and returns user profile with JWT token.

### 👥 Member Routes (`/api/members`)
- **`GET /api/members`**
  - **Access**: Private (Admin & Treasurer)
  - **Headers**: `Authorization: Bearer <token>`
  - **Function**: Retrieves all registered society members (excluding password hashes).
- **`GET /api/members/profile`**
  - **Access**: Private (Logged-in user)
  - **Function**: Returns current authenticated user profile.

### 💳 Payment Routes (`/api/payments`)
- **`GET /api/payments`**
  - **Access**: Private (Admin & Treasurer)
  - **Function**: Returns all payment records sorted by newest first, populated with member details (`fullName`, `membershipNo`, `nic`).
- **`GET /api/payments/member/:memberId`**
  - **Access**: Private
  - **Function**: Returns payments recorded for a specific member.
- **`GET /api/payments/my-payments`**
  - **Access**: Private (Logged-in Member)
  - **Function**: Returns the logged-in member's own payment history sorted by newest first.
- **`POST /api/payments`**
  - **Access**: Private (Admin & Treasurer)
  - **Content-Type**: `multipart/form-data`
  - **Body**: `memberId`, `amount`, `paymentType`, `monthYear`, `paymentMethod`, `remarks`, `description`, `receipt` (file optional)
  - **Function**: Saves payment record, processes multer file upload to `uploads/receipts/`, generates receipt URL and unique receipt code.
- **`POST /api/payments/submit`**
  - **Access**: Private (Logged-in Member)
  - **Content-Type**: `multipart/form-data`
  - **Body**: `amount`, `paymentType`, `monthYear`, `paymentMethod`, `remarks`, `receipt` (file required)
  - **Function**: Member self-service payment submission. Creates a payment record with status `'Pending'` requiring Admin/Treasurer approval.
- **`PUT /api/payments/:id/status`**
  - **Access**: Private (Admin & Treasurer)
  - **Body**: `{ status }` — `'Approved'` or `'Rejected'`
  - **Function**: Updates a member-submitted payment's approval status.

### ⚖️ Claim Routes (`/api/claims`)
- **`POST /api/claims`**
  - **Access**: Private (Logged-in Member)
  - **Body**: `{ deceasedName, relationship, claimAmount, deathCertificateNo }`
  - **Function**: Submits a new death benefit claim request.
- **`GET /api/claims`**
  - **Access**: Private (Admin & Treasurer)
  - **Function**: Retrieves all claim requests populated with requesting member details.
- **`PUT /api/claims/:id/status`**
  - **Access**: Private (Admin & Treasurer)
  - **Body**: `{ status, remarks }`
  - **Function**: Updates claim status to `Approved`, `Rejected`, or `Paid` and records reviewer ID.

---

## 🎨 6. Frontend Features

### 1. Authentication & Session Security
- **Glassmorphism Login Screen (`Login.jsx`)**: NIC & Password authentication with input validation. Stores JWT token & `userInfo` in `localStorage`.
- **Protected Route Guard (`App.jsx`)**: Route protection checking valid token state before rendering dashboard pages.
- **Axios Interceptor (`api.js`)**: Auto-injects `Authorization: Bearer <token>` into all outbound HTTP requests. Also exports named helper functions `getMyPayments()` and `submitMemberPayment()` for member self-service API calls.

### 2. Dashboard Navigation & Overview (`Dashboard.jsx`)
- Responsive sidebar navigation between **Overview**, **Members**, **Payments**, and **Benefit Claims**.
- Header welcome bar displaying user full name and role badge (`Admin`, `Treasurer`, `Member`).
- Interactive dashboard quick-action cards for rapid feature access.

### 3. Member Directory Management (`Members.jsx`)
- Member table displaying Membership No, Full Name, NIC, Phone Number, and Role badge.
- Live search bar filtering by Name, NIC, or Membership Number.
- **"Add New Member" Modal**: Modal form for registering new members with role assignment and live feedback alert messages.
- **Array & Null Safety**: Built-in fallback guards against missing fields or network error payloads.

### 4. Subscription & Fine Management (`Payments.jsx`)
- Complete payment history data table showing paid date, target month, member names, payment types, payment methods, receipt view, total amounts, and download receipt action.
- **Payment Status Badges**: Visual status indicators for payment approval states (`Pending` → yellow, `Approved` → green, `Rejected` → red).
- **"Record Payment" Dynamic Modal Form**:
  - **Member Selector**: Dropdown listing active members (`MEM-xxxx - Name (NIC)`).
  - **Paid Months Auto-Disabling**: Automatically parses member payment history to disable previously paid months.
  - **Next Unpaid Month Auto-Selection**: Automatically selects the next unpaid month upon choosing a member.
  - **Multi-Month Selection**: Supports paying for multiple subscription months in a single submission.
  - **Automated Late Fine Calculation**: Identifies overdue months (`month < currentMonth`), displays late month count, and adds late fine (`Rs 100 per late month`).
  - **Receipt Attachment & Preview**: Supports attaching image/PDF receipts (up to 5MB) and viewing them in an inline modal.
- **One-Click PDF Reports**:
  - Download individual payment receipt PDFs.
  - Export full society financial summary report PDF via header action button.

### 5. Member Self-Service Payment (`MemberPaymentModal.jsx`)
- Reusable modal component for members to submit their own payments online.
- Includes month/year selector, amount input, payment method dropdown (Bank Transfer, Cash Deposit, Online Banking).
- Receipt slip file upload (image or PDF) — required for submission.
- Optional remarks field for additional notes.
- Payments are submitted with `status: 'Pending'` and require Admin/Treasurer approval.

### 6. Death Benefit Claims Management (`Claims.jsx`)
- Dedicated Benefit Claims management dashboard tab.
- Status badges: `Pending` (Amber), `Approved` (Green), `Rejected` (Red), `Paid` (Blue).
- Live search filter by Deceased Name, Member Name, Membership No, or Death Certificate No.
- **"Submit Claim Request" Modal**: Form to select member, deceased name, relationship (`Spouse`, `Parent`, `Child`, `Self`), claim benefit amount, and death certificate reference number.
- **Admin Status Controls**: Quick-action buttons (`Approve`, `Reject`, `Mark as Paid`) for Admins and Treasurers to review claims.

### 7. PDF Report Generation Utility (`generatePDF.js`)
- **ES Module & Vite Compatible**: Resolved `jspdf-autotable` bundler compatibility by dynamically resolving `autoTable` module exports (`autoTable(doc, options)`), preventing `TypeError: doc.autoTable is not a function` runtime issues.
- `generateReceiptPDF(payment)`: Formats individual transaction receipts with society header, member details, payment type, amount breakdown, and computer-generated receipt disclaimer.
- `generateFinancialReportPDF(paymentsList)`: Builds styled multi-page society financial summary reports with table columns (`#`, `Date`, `Mem No`, `Member Name`, `Type`, `Month`, `Method`, `Amount`) and total collection sum.
- **Robust Error Handling**: Added `try-catch` blocks and user alerts to handle empty list states or generation errors gracefully.

---

## 🔧 7. Multer File Upload Configuration

The payment routes file (`paymentRoutes.js`) includes an inline multer configuration for handling receipt file uploads:

| Setting | Value | Description |
| :--- | :--- | :--- |
| **Storage Destination** | `uploads/receipts/` | Directory for receipt files |
| **Filename Pattern** | `receipt-<timestamp>-<random>.<ext>` | Prevents duplicate filenames |
| **Allowed File Types** | JPEG, JPG, PNG, PDF | Only images and PDF documents |
| **Max File Size** | 5 MB | Files exceeding this are rejected |
| **Form Field Name** | `receipt` | Multer expects `upload.single('receipt')` |

---

## 🚀 8. How to Run the Project Locally

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas cluster URI or Local MongoDB service

### Step 1: Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Check .env configuration
# PORT=5000
# MONGO_URI=mongodb+srv://...
# JWT_SECRET=super_secret_ekamuthu_key_12345

# Run backend development server
npm run dev
```
Backend API will run on `http://localhost:5000`.

### Step 2: Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run frontend Vite development server
npm run dev
```
Frontend Web App will run on `http://localhost:5173`.

---

## 🐛 9. Bug Fixes Applied

The following critical bugs were identified and resolved during the code review phase:

| # | File | Bug Description | Fix Applied |
| :--- | :--- | :--- | :--- |
| 1 | `Payment.js` | Duplicate `paymentSchema` definition after `module.exports` caused startup crash | Removed duplicate; merged `status` field into original schema |
| 2 | `paymentRoutes.js` | Imported non-existent `uploadMiddleware` file — crash on require | Removed import; inlined multer config directly in routes file |
| 3 | `paymentRoutes.js` | Imported `getPayments` (wrong name) from controller instead of `getAllPayments` | Fixed import name to `getAllPayments` |
| 4 | `paymentRoutes.js` | Dead duplicate code block (routes, multer config, schema) after `module.exports` | Removed all dead code; single clean `module.exports` |
| 5 | `paymentController.js` | Functions `getMyPayments`, `submitMemberPayment`, `updatePaymentStatus` not exported | Added all 3 functions to `module.exports` |
| 6 | `paymentController.js` | `createPayment` didn't handle `remarks`, `paymentMethod`, or receipt file uploads | Added field destructuring and multer `req.file` handling |
| 7 | `api.js` | Named exports referenced `api` (lowercase) instead of `API` (uppercase) — `ReferenceError` | Fixed to use `API` (matching the Axios instance name) |
| 8 | Multiple files | Sinhala Unicode text in code comments, UI labels, error messages, and dropdown options | Translated all 22+ instances to English across 7 files |

---

## 🗺️ 10. Future Roadmap & Enhancements

1. **Role-Based View Scoping**:
   - Customize dashboard overview widgets based on the logged-in role so regular `Member` users view only their personal payments, arrears, and dependents.
2. **Automated SMS / Email Notifications**:
   - Integrate an SMS Gateway (e.g. Dialog SMS / Twilio) to send monthly subscription reminders and claim approval alerts.
3. **Advanced Analytics Dashboard**:
   - Add collection vs payout charts using `Chart.js` or `Recharts` to visualize society monthly cashflows and reserves.
4. **Member Payment Approval Workflow**:
   - Integrate the `MemberPaymentModal` component into the member dashboard view with Admin notification alerts for pending payment approvals.

---
*Documentation fully updated and verified for EkamuthuERP codebase.*  
*All bugs fixed. All Sinhala comments translated to English.*  
*Ready for Production & Developer Handoff!* 🚀
