# 📘 EkamuthuERP - Project Documentation & Handover Guide
> **Cloud-Based Community Mutual Aid & Death Donation Society Management System**

---

## 📌 1. Project Overview

**EkamuthuERP** is a full-stack Enterprise Resource Planning (ERP) application developed specifically for Community Mutual Aid Societies (Death Donation Societies). It automates member registrations, monthly subscription tracking, overdue fine calculations, payment receipt management, death benefit claim processing, real-time dashboard analytics, and PDF financial report generation.

This document serves as the master technical handoff guide for developers maintaining or expanding this codebase.

> [!NOTE]
> AI-assisted development tooling was used during the building, debugging, and documentation phases of this project. All code has been reviewed and verified for correctness.

---

## 🛠️ 2. Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js (v5)
- **Database**: MongoDB with Mongoose ODM (v9)
- **Authentication**: JSON Web Tokens (JWT) & `bcryptjs` password hashing (with NIC normalization)
- **File Uploads**: `multer` with custom storage engine (Stores payment receipts in `uploads/receipts/`)
- **CORS**: Enabled via `cors` middleware

### Frontend
- **Framework**: React.js (v19) built with Vite (v8)
- **Styling**: Tailwind CSS (v4)
- **Icons**: `lucide-react`
- **Charts**: `recharts` (Bar charts & Pie charts for financial overview)
- **Routing**: `react-router-dom` (v7)
- **HTTP Client**: Axios with custom request interceptors for automatic JWT injection
- **PDF Generation**: `jspdf` & `jspdf-autotable` (Receipts & Financial Summary Reports)

---

## 📁 3. Directory Structure

```
ekamuthu-erp/
├── backend/
│   ├── config/
│   │   └── db.js                   # MongoDB database connection with Google DNS failover
│   ├── controllers/
│   │   ├── authController.js       # User registration & login logic with JWT generation & NIC sanitization
│   │   ├── memberController.js     # Member directory listing & user profile retrieval
│   │   ├── paymentController.js    # Payment recording, member self-service payments,
│   │   │                           #   receipt uploads & payment status management
│   │   ├── claimController.js      # Death benefit claim submission & status workflow
│   │   └── dashboardController.js  # Real-time analytics, revenue metrics & monthly chart aggregation
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
│   │   ├── claimRoutes.js          # POST/GET /api/claims, PUT /api/claims/:id/status
│   │   └── dashboardRoutes.js      # GET /api/dashboard/stats
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
│   │   │   ├── Dashboard.jsx       # Real-time dashboard layout with analytics charts & stats
│   │   │   ├── Members.jsx         # Member list table & "Add New Member" registration modal
│   │   │   ├── Payments.jsx        # Payments table, multi-month selector, fine calculator,
│   │   │   │                       #   receipt uploader, status badges & PDF export
│   │   │   └── Claims.jsx          # Benefit claims table, claim request form,
│   │   │                           #   approval & rejection workflow
│   │   ├── utils/
│   │   │   └── generatePDF.js      # Receipt & Financial Report PDF generator using jsPDF
│   │   ├── api.js                  # Axios instance with JWT headers & API helpers
│   │   ├── App.jsx                 # React router setup & ProtectedRoute wrapper
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx                # Application root renderer
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── IMPLEMENTATION_PLAN.md          # Active implementation plan & feature roadmap
├── README.md                       # Quick start & repository overview
└── PROJECT_DOCUMENTATION.md        # Master project documentation
```

---

## 🗄️ 4. Database Models & Schemas

### A. User Model (`User.js`)
Stores member directory data, access credentials, and society roles.

| Field | Type | Description |
| :--- | :--- | :--- |
| `membershipNo` | String | Unique auto-generated ID (e.g. `MEM-0001`) |
| `fullName` | String | Member's full name (Required) |
| `nic` | String | National Identity Card number (Unique, Required, Normalized) |
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
| `paymentMethod` | String | `'Cash'`, `'Bank Transfer'`, `'Credit/Debit Card'`, etc. (Default: `'Cash'`) |
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
  - **Function**: Registers a new member, sanitizes NIC, auto-generates `membershipNo` (`MEM-0001`...), hashes password, and returns JWT token.
- **`POST /api/auth/login`**
  - **Access**: Public
  - **Function**: Authenticates credentials using NIC normalization (`.trim().toUpperCase()`) and returns user profile with JWT.

### 👥 Member Routes (`/api/members`)
- **`GET /api/members`**
  - **Access**: Private (Admin & Treasurer)
  - **Function**: Retrieves all registered society members.

### 💳 Payment Routes (`/api/payments`)
- **`GET /api/payments`**
  - **Access**: Private (Admin & Treasurer)
  - **Function**: Returns all payment records sorted by newest first, populated with member details.
- **`POST /api/payments`**
  - **Access**: Private (Admin & Treasurer)
  - **Function**: Saves payment record, processes multer receipt upload to `uploads/receipts/`.
- **`POST /api/payments/submit`**
  - **Access**: Private (Logged-in Member)
  - **Function**: Member self-service payment submission with status `'Pending'` (Auto-approved if Card).
- **`PUT /api/payments/:id/status`**
  - **Access**: Private (Admin & Treasurer)
  - **Function**: Updates a member-submitted payment's approval status.

### 📊 Dashboard Routes (`/api/dashboard`)
- **`GET /api/dashboard/stats`**
  - **Access**: Private (Protected via JWT)
  - **Function**: Returns real-time MongoDB aggregations: `totalMembers`, `totalRevenue`, `thisMonthRevenue`, `pendingApprovals`, `recentPayments`, `monthlyChartData`, and `methodData`.

---

## 🚀 6. How to Run the Project Locally

```bash
# 1. Backend Setup
cd backend
npm install
npm run dev

# 2. Frontend Setup
cd frontend
npm install
npm run dev
```

---
*Documentation updated for EkamuthuERP codebase.* 🚀
