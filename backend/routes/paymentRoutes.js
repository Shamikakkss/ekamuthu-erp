const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Payment = require('../models/Payment'); // ඔයාගේ Payment Model එක

// 1. Multer Storage Engine එක Configure කිරීම (Unique File Names සැකසීමට)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/receipts/'); // File එක Save වෙන තැන
    },
    filename: (req, file, cb) => {
        // File Name එක Duplicate නොවීමට Unique Timestamp එකක් එකතු කිරීම
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'receipt-' + uniqueSuffix + ext);
    }
});

// 2. File Type Filter (Images & PDFs විතරක් Allow කිරීම)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG, PNG and PDF files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Maximum 5MB Limit
});

// 3. GET Route for Fetching All Payments
router.get('/', async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('member', 'fullName membershipNo nic')
            .populate('recordedBy', 'fullName role')
            .sort({ createdAt: -1 });

        res.json(payments);
    } catch (err) {
        console.error('Error fetching payments:', err);
        res.status(500).json({ message: err.message || 'Server error fetching payments' });
    }
});

// 4. POST Route for Recording Payment with Receipt Attachment
router.post('/', upload.single('receipt'), async (req, res) => {
    try {
        const { memberId, amount, paymentType, monthYear, paymentMethod, remarks } = req.body;

        // Upload වුණු File එකක් තිබේ නම් අදාළ File Path එක සැකසීම
        let receiptUrl = null;
        if (req.file) {
            // Full URL path to access from frontend
            receiptUrl = `${req.protocol}://${req.get('host')}/uploads/receipts/${req.file.filename}`;
        }

        const receiptNo = `REC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const newPayment = new Payment({
            member: memberId,
            amount,
            paymentType,
            monthYear,
            paymentMethod,
            remarks,
            receiptNo,
            receiptUrl // Receipts File URL එක DB එකට Save වෙනවා
        });

        await newPayment.save();
        res.status(201).json({ message: 'Payment recorded successfully', payment: newPayment });

    } catch (err) {
        console.error('Error saving payment:', err);
        res.status(500).json({ message: err.message || 'Server error recording payment' });
    }
});

module.exports = router;