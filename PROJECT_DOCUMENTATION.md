# 📘 EkamuthuERP - Project Documentation & Handover Guide
> **Cloud-Based Community Mutual Aid & Death Donation Society Management System**  
> *(මරණාධාර සමිති ERP පද්ධතිය)*

---

## 📌 1. Project Overview (පද්ධති හැඳින්වීම)

**EkamuthuERP** is a full-stack Enterprise Resource Planning (ERP) application developed specifically for Community Mutual Aid Societies (*මරණාධාර සමිති*). It automates member registrations, monthly subscription tracking, overdue fine calculations, payment receipt management, death benefit claim processing, and PDF financial report generation.

This document serves as the master technical handoff guide for developers maintaining or expanding this codebase.

---

## 🛠️ 2. Technology Stack (භාවිත කර ඇති තාක්ෂණ)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js (v5)
- **Database**: MongoDB with Mongoose ODM (v9)
- **DNS Failover**: Custom Google DNS resolver (`8.8.8.8`) to bypass ISP SRV record restrictions
- **Authentication**: JSON Web Tokens (JWT) & `bcryptjs` password hashing
- **File Uploads**: `multer` (Stores payment receipts in `uploads/receipts/`)
- **CORS**: Enabled via `cors` middleware

### Frontend
- **Framework**: React.js (built with Vite)
- **Styling**: Tailwind CSS
- **Icons**: `lucide-react`
- **Routing**: `react-router-dom` (v7)
- **HTTP Client**: Axios with custom request interceptors for JWT injection
- **PDF Generation**: `jspdf` & `jspdf-autotable` (Receipts & Financial Summary Reports)

---

## 📁 3. Directory Structure (ගොනු ව්‍යුහය)

```
ekamuthu-erp/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB database connection configuration & DNS resolver
│   ├── controllers/
│   │   ├── authController.js   # User registration & login logic
│   │   ├── memberController.js # Member directory & profile retrieval logic
│   │   ├── paymentController.js# Payment collection & receipt upload logic
│   │   └── claimController.js  # Death benefit claim request & status workflow logic
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT authentication (protect) & Role authorization (authorize)
│   ├── models/
│   │   ├── User.js             # Schema for Members & Admins (with dependents & roles)
│   │   ├── Payment.js          # Schema for Subscriptions, Fines, and Receipts
│   │   └── Claim.js            # Schema for Death Benefit Claims
│   ├── routes/
│   │   ├── authRoutes.js       # Endpoints: /api/auth/register, /api/auth/login
│   │   ├── memberRoutes.js     # Endpoints: /api/members, /api/members/profile
│   │   ├── paymentRoutes.js    # Endpoints: /api/payments (GET, POST with file upload)
│   │   └── claimRoutes.js      # Endpoints: /api/claims (POST, GET, PUT status)
│   ├── uploads/
│   │   └── receipts/           # Physical directory storing uploaded payment receipts
│   ├── .env                    # Environment variables (PORT, MONGO_URI, JWT_SECRET)
│   ├── package.json
│   └── server.js               # Main API server entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx       # User login screen with NIC & Password
│   │   │   ├── Dashboard.jsx   # Main layout with navigation sidebar & stats overview
│   │   │   ├── Members.jsx     # Member list table & "Add New Member" modal
│   │   │   ├── Payments.jsx    # Payments table, multi-month selector, fine calculator, receipt uploader, PDF export
│   │   │   └── Claims.jsx      # Benefit claims table, claim request form, approval & rejection workflow
│   │   ├── utils/
│   │   │   └── generatePDF.js  # Receipt & Financial Report PDF generator using jsPDF
│   │   ├── api.js              # Axios instance attached with JWT authorization headers
│   │   ├── App.jsx             # React router setup & ProtectedRoute wrapper
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── README.md                   # Quick start & repository overview
└── PROJECT_DOCUMENTATION.md    # Master project documentation file
```

---

## 🗄️ 4. Database Models & Schemas (දත්ත සමුදායේ ව්‍යුහය)

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
Tracks monthly subscription collections, fine assessments, and uploaded payment receipts.

| Field | Type | Description |
| :--- | :--- | :--- |
| `member` | ObjectId | Refers to `User` model (Required) |
| `amount` | Number | Amount paid in LKR (Required) |
| `paymentType` | String | `'Monthly Subscription'`, `'Fine'`, `'Admission Fee'`, etc. |
| `monthYear` | String | Target month string (e.g., `"2026-07"`) |
| `paymentMethod` | String | `'Cash'`, `'Bank Transfer'`, etc. (Default: `'Cash'`) |
| `remarks` | String | Auto-generated or custom payment notes |
| `receiptNo` | String | Auto-generated unique receipt code (e.g. `REC-1721758923`) |
| `receiptUrl` | String | Absolute file URL of attached receipt image/PDF |
| `recordedBy` | ObjectId | Refers to `User` (Treasurer/Admin who recorded payment) |
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

## 📡 5. API Endpoints Reference (පද්ධතියේ API සේවාවන්)

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
- **`POST /api/payments`**
  - **Access**: Private (Admin & Treasurer)
  - **Content-Type**: `multipart/form-data`
  - **Body**: `memberId`, `amount`, `paymentType`, `monthYear`, `paymentMethod`, `remarks`, `receipt` (file optional)
  - **Function**: Saves payment, processes Multer file upload to `uploads/receipts/`, generates receipt URL and receipt code.

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

## 🎨 6. Frontend Features Completed (මේ වන විට නිමකර ඇති මෘදුකාංග කොටස්)

### 1. Authentication & Session Security
- **Glassmorphism Login Screen (`Login.jsx`)**: NIC & Password authentication with input validation. Stores JWT token & `userInfo` in `localStorage`.
- **Protected Route Guard (`App.jsx`)**: Route protection checking valid token state before rendering dashboard pages.
- **Axios Interceptor (`api.js`)**: Auto-injects `Authorization: Bearer <token>` into all outbound HTTP requests.

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
- Complete payment history data table showing member names, payment types, target months, payment methods, total amounts, and receipt view options.
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

### 5. Death Benefit Claims Management (`Claims.jsx`)
- Dedicated Benefit Claims management dashboard tab.
- Status badges: `Pending` (Yellow), `Approved` (Green), `Rejected` (Red), `Paid` (Blue).
- Live search filter by Deceased Name, Member Name, Membership No, or Death Certificate No.
- **"Submit Claim Request" Modal**: Form to select member, deceased name, relationship (`Spouse`, `Parent`, `Child`, etc.), claim benefit amount, and death certificate reference number.
- **Admin Status Controls**: Quick-action buttons (`Approve`, `Reject`, `Mark as Paid`) for Admins and Treasurers to review claims.

### 6. PDF Report Generation Utility (`generatePDF.js`)
- **ES Module & Vite Compatible**: Resolved `jspdf-autotable` bundler compatibility by dynamically resolving `autoTable` module exports (`autoTable(doc, options)`), preventing `TypeError: doc.autoTable is not a function` runtime issues.
- `generateReceiptPDF(payment)`: Formats individual transaction receipts with society header, member details, payment type, amount breakdown, and computer-generated receipt disclaimer.
- `generateFinancialReportPDF(paymentsList)`: Builds styled multi-page society financial summary reports with table columns (`#`, `Date`, `Mem No`, `Member Name`, `Type`, `Month`, `Method`, `Amount`) and total collection sum.
- **Robust Error Handling**: Added `try-catch` blocks and user alerts to handle empty list states or generation errors gracefully.

---

## 🚀 7. How to Run the Project Locally (පද්ධතිය Run කරගන්නා ආකාරය)

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

## 🗺️ 8. Future Roadmap & Enhancements (ඉදිරියට කළ හැකි වැඩිදියුණු කිරීම්)

1. **Role-Based View Scoping**:
   - Customize dashboard overview widgets based on the logged-in role so regular `Member` users view only their personal payments, arrears, and dependents.
2. **Automated SMS / Email Notifications**:
   - Integrate an SMS Gateway (e.g. Dialog SMS / Twilio) to send monthly subscription reminders and claim approval alerts.
3. **Advanced Analytics Dashboard**:
   - Add collection vs payout charts using `Chart.js` or `Recharts` to visualize society monthly cashflows and reserves.

---
*Documentation updated and verified for EkamuthuERP codebase.*  
*Ready for Production & Developer Handoff!* 🚀
