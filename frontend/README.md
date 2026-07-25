# ⚛️ EkamuthuERP - Frontend Web Application

The frontend user interface for **EkamuthuERP**, a community mutual aid society management system built with React, Vite, Tailwind CSS, and Lucide Icons.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Backend API running on `http://localhost:5000`

### Installation & Execution

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The application will run at `http://localhost:5173`.

---

## 🛠️ Key Libraries & Modules

- **React 19 & Vite**: Ultra-fast component framework and build tool.
- **Tailwind CSS**: Modern utility-first CSS styling.
- **Lucide React**: Icon library for intuitive UI controls.
- **Axios**: HTTP client with custom JWT header injection ([api.js](file:///d:/HNDIT/test%20projects/EkamuthuERP/ekamuthu-erp/frontend/src/api.js)).
- **jsPDF & jsPDF-AutoTable**: Client-side PDF generation for receipts and financial reports ([generatePDF.js](file:///d:/HNDIT/test%20projects/EkamuthuERP/ekamuthu-erp/frontend/src/utils/generatePDF.js)).

---

## 📱 Page Modules

- 🔐 **[Login.jsx](file:///d:/HNDIT/test%20projects/EkamuthuERP/ekamuthu-erp/frontend/src/pages/Login.jsx)**: Glassmorphism sign-in form.
- 📊 **[Dashboard.jsx](file:///d:/HNDIT/test%20projects/EkamuthuERP/ekamuthu-erp/frontend/src/pages/Dashboard.jsx)**: Main layout with navigation sidebar and statistics overview.
- 👥 **[Members.jsx](file:///d:/HNDIT/test%20projects/EkamuthuERP/ekamuthu-erp/frontend/src/pages/Members.jsx)**: Member directory, real-time search, and registration modal.
- 💳 **[Payments.jsx](file:///d:/HNDIT/test%20projects/EkamuthuERP/ekamuthu-erp/frontend/src/pages/Payments.jsx)**: Payment records, multi-month picker, fine calculator, receipt viewer & PDF download.
- ⚖️ **[Claims.jsx](file:///d:/HNDIT/test%20projects/EkamuthuERP/ekamuthu-erp/frontend/src/pages/Claims.jsx)**: Death benefit claim requests and administrative status review.

---
*EkamuthuERP Frontend Documentation*
