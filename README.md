# 📘 EkamuthuERP
> **Cloud-Based Community Mutual Aid & Death Donation Society Management System** (*මරණාධාර සමිති ERP පද්ධතිය*)

EkamuthuERP is a modern Enterprise Resource Planning (ERP) web application engineered specifically for Community Mutual Aid Societies (*මරණාධාර සමිති*). It streamlines member directory management, monthly subscription collections, automated late fine calculations, bank transfer receipt management, death benefit claim processing, and PDF financial report generation.

---

## 🌟 Key Features Completed

- 👥 **Member Management**: Complete member directory, search filter by Name/NIC/Member No, and dynamic role assignment (`Admin`, `Treasurer`, `Member`).
- 💳 **Subscription & Fine Tracking**: Automated month-by-month payment recording, smart selection of next unpaid month, and automatic calculation of late fines (`Rs 100/late month`).
- 📄 **Receipt & PDF Report Generation**: One-click PDF receipt generation for individual transactions and full society financial report exports via `jsPDF`.
- ⚖️ **Death Benefit Claims**: Dedicated claim submission and status workflow (`Pending`, `Approved`, `Rejected`, `Paid`) with administrative approval notes.
- 🔐 **JWT & Role Security**: Secure authentication using JSON Web Tokens (JWT), bcrypt password hashing, and role-based authorization middleware.
- ☁️ **Cloud Database Integration**: Connected to MongoDB Atlas with Google DNS failover to ensure stable connectivity.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Node.js, Express.js (v5), MongoDB (Mongoose ODM), JWT, Bcrypt, Multer |
| **Frontend** | React.js (Vite), Tailwind CSS, Lucide React Icons, Axios, jsPDF & AutoTable |
| **Database** | MongoDB Atlas Cloud Database |

---

## 📖 Project Documentation & Handoff Guide

For full technical details, database schemas, API references, directory structure, and developer guidelines:

➡️ **[View Complete Project Documentation & Handoff Guide](./PROJECT_DOCUMENTATION.md)**

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas URI or Local MongoDB instance

### 1. Backend Setup
```bash
cd backend

# Install backend dependencies
npm install

# Start backend API server (runs on http://localhost:5000)
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend

# Install frontend dependencies
npm install

# Start frontend Vite development server (runs on http://localhost:5173)
npm run dev
```

---

## 📁 Repository Structure

```
ekamuthu-erp/
├── backend/                  # Node.js + Express.js API Server
│   ├── config/db.js          # MongoDB connection with DNS resolution fallback
│   ├── controllers/          # Business logic (Auth, Members, Payments, Claims)
│   ├── middleware/           # JWT verification & role authorization
│   ├── models/               # Mongoose Schemas (User, Payment, Claim)
│   ├── routes/               # API routes definitions
│   └── uploads/receipts/     # Stored physical receipt attachments
├── frontend/                 # React.js + Vite Application
│   ├── src/
│   │   ├── pages/            # Login, Dashboard, Members, Payments, Claims
│   │   ├── utils/            # generatePDF.js (Receipts & Financial Reports)
│   │   ├── api.js            # Axios client with JWT auto-injection
│   │   └── App.jsx           # Protected routes & routing configuration
└── PROJECT_DOCUMENTATION.md  # Detailed developer documentation
```

---
*Developed for Ekamuthu Community Mutual Aid Society.*  
*Ready for Production & Developer Handoff!* 🚀
