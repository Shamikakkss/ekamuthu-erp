# 🗺️ EkamuthuERP - Implementation Plan & Future Roadmap

This implementation plan outlines the upcoming features, architectural improvements, and system integrations scheduled for **EkamuthuERP**.

---

## 📌 Goal Description

To expand EkamuthuERP into a production-grade system with automated SMS/Email reminders, fine-grained role-based view scoping, multi-currency / bank payment gateway integration, and printable annual member statements.

---

## ⚠️ User Review Required

> [!IMPORTANT]
> **SMS Gateway Provider Selection**: Please confirm whether to integrate Dialog SMS Gateway (Local Sri Lanka) or Twilio SMS Gateway for automated subscription reminders.

> [!NOTE]
> **Member Portal Views**: Regular `Member` users will have restricted access to sensitive society financial totals. Dashboard widgets will automatically scope to individual member payment histories and arrears.

---

## ❓ Open Questions

> [!WARNING]
> Should late fines be automatically calculated and appended to member monthly dues on the 1st of every month via a scheduled background cron job, or should fine assessment remain manual during payment collection?

---

## 🛠️ Proposed Changes

---

### Backend API Services

Enhance backend services with automated notification queues, background cron jobs, and expanded analytics routes.

#### [NEW] [notificationService.js](file:///d:/HNDIT/test%20projects/EkamuthuERP/ekamuthu-erp/backend/services/notificationService.js)
- Implement SMS & Email notification dispatchers using Nodemailer & Dialog SMS API.

#### [NEW] [cronJobs.js](file:///d:/HNDIT/test%20projects/EkamuthuERP/ekamuthu-erp/backend/config/cronJobs.js)
- Schedule monthly subscription due reminders on the 25th of every month.
- Auto-flag overdue member months on the 1st of every month.

#### [MODIFY] [userRoutes.js](file:///d:/HNDIT/test%20projects/EkamuthuERP/ekamuthu-erp/backend/routes/userRoutes.js)
- Add endpoints for password reset requests, member profile photo uploads, and dependent management.

---

### Frontend UI Components & Views

Enhance member portal, interactive analytics, and audit logging views.

#### [NEW] [MemberPortal.jsx](file:///d:/HNDIT/test%20projects/EkamuthuERP/ekamuthu-erp/frontend/src/pages/MemberPortal.jsx)
- Dedicated member self-service portal showing personal subscription status, dependents list, claim request status, and downloadable receipts.

#### [NEW] [Analytics.jsx](file:///d:/HNDIT/test%20projects/EkamuthuERP/ekamuthu-erp/frontend/src/pages/Analytics.jsx)
- Detailed financial forecasting, month-over-month collection comparisons, and benefit claim payout distributions using `Recharts`.

#### [MODIFY] [Payments.jsx](file:///d:/HNDIT/test%20projects/EkamuthuERP/ekamuthu-erp/frontend/src/pages/Payments.jsx)
- Add Excel export (`xlsx` / CSV export) for monthly financial audits.

---

## 🧪 Verification Plan

### Automated Tests
- Run backend API integration tests via `supertest`.
- Verify JWT role authorization middleware for `Member`, `Treasurer`, and `Admin` roles.

### Manual Verification
- Test automated SMS reminder triggers using a sandbox API key.
- Verify role-based routing redirection when logging in as a regular `Member` vs `Admin`.
