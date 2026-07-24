# 📘 EkamuthuERP - Project Documentation & Handover Guide
> **Cloud-Based Community Mutual Aid & Death Donation Society Management System**  
> *(මරණාධාර සමිති ERP පද්ධතිය)*

---

## 📌 1. Project Overview (පද්ධති හැඳින්වීම)

**EkamuthuERP** is a web-based Enterprise Resource Planning (ERP) application developed for Community Mutual Aid Societies (*මරණාධාර සමිති*). It automates member registrations, monthly subscription tracking, overdue fine calculations, payment receipt management, and death benefit claim processing.

This document serves as the complete technical handoff guide for any developer who takes over the project to continue future development.

---

## 🛠️ 2. Technology Stack (භාවිත කර ඇති තාක්ෂණ)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js (v5)
- **Database**: MongoDB with Mongoose ODM (v9)
- **Authentication**: JSON Web Tokens (JWT) & `bcryptjs` for password hashing
- **File Uploads**: `multer` (Stores receipts in `uploads/receipts/`)
- **CORS**: `cors` middleware enabled for cross-origin requests

### Frontend
- **Framework**: React.js (built with Vite)
- **Styling**: Tailwind CSS
- **Icons**: `lucide-react`
- **Routing**: `react-router-dom` (v6)
- **HTTP Client**: Axios with custom interceptors for JWT injection

---

## 📁 3. Directory Structure (ගොනු ව්‍යුහය)

```
ekamuthu-erp/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB database connection configuration
│   ├── controllers/
│   │   ├── authController.js   # User registration & login logic
│   │   ├── memberController.js # Member directory & profile logic
│   │   ├── paymentController.js# Payment query logic
│   │   └── claimController.js  # Death claim request & approval logic
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
│   │   ├── assets/
│   │   ├── pages/
│   │   │   ├── Login.jsx       # User login screen with NIC & Password
│   │   │   ├── Dashboard.jsx   # Main layout with navigation sidebar & stats overview
│   │   │   ├── Members.jsx     # Member list table & "Add New Member" modal
│   │   │   └── Payments.jsx    # Payments table, multi-month selector, fine calculator, receipt uploader
│   │   ├── api.js              # Axios instance attached with JWT authorization headers
│   │   ├── App.jsx             # React router setup & ProtectedRoute wrapper
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── PROJECT_DOCUMENTATION.md    # Master project documentation file
```

---

## 🗄️ 4. Database Models & Schemas (දත්ත සමුදායේ ව්‍යුහය)

### A. User Model (`User.js`)
Stores all user accounts (Admins, Treasurers, and Members).

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
| `timestamps` | Boolean | Automatically tracks `createdAt` and `updatedAt` |

### B. Payment Model (`Payment.js`)
Tracks monthly subscriptions, late fines, admission fees, and uploaded payment receipts.

| Field | Type | Description |
| :--- | :--- | :--- |
| `member` | ObjectId | Refers to `User` model (Required) |
| `amount` | Number | Amount paid in LKR (Required) |
| `paymentType` | String | `'Monthly Subscription'`, `'Fine'`, `'Admission Fee'`, etc. |
| `monthYear` | String | Target month string (e.g., `"2026-07"`) |
| `paymentMethod` | String | `'Cash'`, `'Bank Transfer'`, etc. (Default: `'Cash'`) |
| `remarks` | String | Auto-generated or custom payment note |
| `receiptNo` | String | Auto-generated unique receipt code (e.g. `REC-1721758923-123`) |
| `receiptUrl` | String | Absolute file URL of attached receipt image/PDF |
| `recordedBy` | ObjectId | Refers to `User` (Treasurer/Admin who recorded payment) |
| `timestamps` | Boolean | Tracks payment creation timestamp |

### C. Claim Model (`Claim.js`)
Tracks death benefit claim requests made by society members.

| Field | Type | Description |
| :--- | :--- | :--- |
| `member` | ObjectId | Refers to requesting `User` (Required) |
| `deceasedName` | String | Name of the deceased individual (Required) |
| `relationship` | String | `'Self'`, `'Spouse'`, `'Child'`, `'Parent'`, etc. (Required) |
| `claimAmount` | Number | Requested benefit sum (Required) |
| `status` | String | `'Pending'`, `'Approved'`, `'Rejected'`, or `'Paid'` |
| `deathCertificateNo` | String | Death certificate reference number (Required) |
| `approvedBy` | ObjectId | Refers to approving Admin/Treasurer |
| `remarks` | String | Administrative notes or rejection reasons |

---

## 📡 5. API Endpoints Reference (පද්ධතියේ API සේවාවන්)

### 🔑 Authentication Routes (`/api/auth`)
- **`POST /api/auth/register`**
  - **Access**: Public / Admin
  - **Body**: `{ fullName, nic, phone, address, password, role, dependents }`
  - **Function**: Registers a new member, auto-generates `membershipNo` (`MEM-0001`, `MEM-0002`...), hashes password, returns user object & JWT token.
- **`POST /api/auth/login`**
  - **Access**: Public
  - **Body**: `{ nic, password }`
  - **Function**: Validates credentials and returns user details with JWT token.

### 👥 Member Routes (`/api/members`)
- **`GET /api/members`**
  - **Access**: Private (Admin & Treasurer only)
  - **Headers**: `Authorization: Bearer <token>`
  - **Function**: Fetches list of all registered members (excluding passwords).
- **`GET /api/members/profile`**
  - **Access**: Private (Logged-in user)
  - **Function**: Returns the current logged-in user's profile.

### 💳 Payment Routes (`/api/payments`)
- **`GET /api/payments`**
  - **Access**: Public / Private
  - **Function**: Returns all payment records sorted by newest first, populated with member details (`fullName`, `membershipNo`, `nic`).
- **`POST /api/payments`**
  - **Access**: Private
  - **Content-Type**: `multipart/form-data`
  - **Body**: `memberId`, `amount`, `paymentType`, `monthYear`, `paymentMethod`, `remarks`, `receipt` (file optional)
  - **Function**: Saves payment, handles Multer file upload to `uploads/receipts/`, generates receipt URL and receipt number.

### ⚖️ Claim Routes (`/api/claims`)
- **`POST /api/claims`**
  - **Access**: Private (Any logged-in member)
  - **Body**: `{ deceasedName, relationship, claimAmount, deathCertificateNo }`
  - **Function**: Submits a new death benefit claim request.
- **`GET /api/claims`**
  - **Access**: Private (Admin & Treasurer)
  - **Function**: Retrieves all claim requests populated with member details.
- **`PUT /api/claims/:id/status`**
  - **Access**: Private (Admin & Treasurer)
  - **Body**: `{ status, remarks }`
  - **Function**: Updates claim status to `Approved`, `Rejected`, or `Paid`.

---

## 🎨 6. Frontend Features Completed (මේ වන විට නිමකර ඇති මෘදුකාංග කොටස්)

### 1. Authentication & Session Management
- **Login Page (`Login.jsx`)**: Designed with high-end glassmorphism UI. Users log in with NIC and Password. Stores JWT token and user info in `localStorage`.
- **Protected Router (`App.jsx`)**: Wraps protected dashboard routes. Automatically redirects unauthenticated users back to login.
- **API Interceptor (`api.js`)**: Automatically attaches `Authorization: Bearer <token>` to every Axios HTTP request.

### 2. Dashboard Layout (`Dashboard.jsx`)
- Sidebar navigation between **Overview**, **Members**, and **Payments**.
- Displays user greeting and user role badge (`Admin`, `Treasurer`, `Member`).
- Header statistics and quick-access feature cards.

### 3. Member Management (`Members.jsx`)
- Interactive Data Table listing member number, full name, NIC, phone, and role badge.
- Real-time search filter by Name, NIC, or Membership Number.
- **"Add New Member" Modal**: Modal dialog to add new members with role assignment.

### 4. Payments & Fine Management (`Payments.jsx`)
- Complete payment history data table with target months, member numbers, payment methods, amounts, and receipt view button.
- Live search filter by member name or membership number.
- **"Record Payment" Dynamic Modal Form**:
  - **Member Select Dropdown**: Populated directly from backend database (`MEM-xxxx - Name (NIC)`).
  - **Paid Month Detection**: Automatically retrieves member's payment history to disable already-paid months.
  - **Smart Next-Month Selection**: Auto-selects the next unpaid month when a member is selected.
  - **Multi-Month Selection**: Allows selecting multiple subscription months in a single form submission.
  - **Automatic Late Fine Calculation**: Detects overdue months (`month < currentMonth`), displays late month count, and adds late fine (`Rs 100 per late month`).
  - **Receipt File Attachment**: Allows attaching payment receipts (PDF, JPG, PNG up to 5MB) for Bank Transfers.
  - **Receipt Preview Modal**: Clicking "View" in table opens an inline modal preview of uploaded receipt files.

---

## 🚀 7. How to Run the Project Locally (පද්ධතිය Run කරගන්නා ආකාරය)

### Prerequisites
- Node.js (v18 or higher)
- MongoDB installed locally OR a MongoDB Atlas connection URI

### Step 1: Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Check .env file configuration
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/ekamuthuERP
# JWT_SECRET=your_jwt_secret_key_here

# Run backend development server
npm run dev
```
Backend server will start on `http://localhost:5000`.

### Step 2: Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run frontend development server
npm run dev
```
Frontend development server will run on `http://localhost:5173`.

---

## 🗺️ 8. Roadmap & Next Steps for Future Developers (ඉදිරියට කළ යුතු වැඩසටහන)

If you are continuing the development of **EkamuthuERP**, here are the recommended next tasks:

1. **Claims Management UI (Frontend Tab)**:
   - Build a dedicated `Claims.jsx` frontend page/tab for members to submit death claim benefit requests and for Admins/Treasurers to review, approve, reject, or mark claims as paid.
2. **Member Self-Service Portal**:
   - Filter dashboard views based on user role (`Member` vs `Admin`/`Treasurer`). Regular members should see their own personal payment history, pending fines, and active family dependents.
3. **Receipt & Financial Reports Generation**:
   - Add PDF export feature for payment receipts using libraries like `html2pdf.js` or `jspdf`.
   - Add a financial summary dashboard tab showing monthly collection totals, outstanding arrears, and financial balance.
4. **SMS / Email Reminders**:
   - Integrate an SMS gateway (e.g., Dialog SMS API / Twilio) to send automated monthly subscription reminder messages to members.

---
*Documentation compiled and verified for EkamuthuERP codebase.*  
*Ready for Developer Handoff!* 🚀
