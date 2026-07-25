const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    createPayment,
    getAllPayments,
    getMemberPayments,
    getMyPayments,
    submitMemberPayment,
    updatePaymentStatus
} = require('../controllers/paymentController');

// ---------------------------------------------------------------
// Multer Storage Configuration (Unique filenames for receipts)
// ---------------------------------------------------------------
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/receipts/'); // Directory where files are saved
    },
    filename: (req, file, cb) => {
        // Add unique timestamp to prevent duplicate filenames
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'receipt-' + uniqueSuffix + ext);
    }
});

// File type filter — Allow only images and PDFs
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG, PNG and PDF files are allowed!'), false);
    }
};

// Multer upload middleware instance (5MB max file size)
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Maximum 5MB limit
});

// ---------------------------------------------------------------
// Member Routes (Logged-in member self-service)
// ---------------------------------------------------------------

// Get logged-in member's own payment history
router.get('/my-payments', protect, getMyPayments);

// Member submits a payment receipt for approval
router.post('/submit', protect, upload.single('receipt'), submitMemberPayment);

// ---------------------------------------------------------------
// Admin & Treasurer Routes
// ---------------------------------------------------------------

// Get all payment records with member details
router.get('/', protect, authorize('Admin', 'Treasurer'), getAllPayments);

// Get payments for a specific member by ID
router.get('/member/:memberId', protect, getMemberPayments);

// Record a new payment with optional receipt attachment
router.post('/', protect, authorize('Admin', 'Treasurer'), upload.single('receipt'), createPayment);

// Approve or reject a member-submitted payment
router.put('/:id/status', protect, authorize('Admin', 'Treasurer'), updatePaymentStatus);

module.exports = router;