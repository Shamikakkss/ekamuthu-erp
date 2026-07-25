const Payment = require('../models/Payment');
const User = require('../models/User');

// @desc    Record a new payment (Collect cash)
// @route   POST /api/payments
// @access  Private (Admin & Treasurer only)
const createPayment = async (req, res) => {
    try {
        const { memberId, amount, paymentType, monthYear, paymentMethod, remarks, description } = req.body;

        // Check if member exists
        const member = await User.findById(memberId);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        // Generate a unique receipt number (e.g., REC-1721758923-4821)
        const receiptNo = `REC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

        // Build receipt URL if a file was uploaded via multer
        let receiptUrl = null;
        if (req.file) {
            receiptUrl = `${req.protocol}://${req.get('host')}/uploads/receipts/${req.file.filename}`;
        }

        const payment = await Payment.create({
            member: memberId,
            amount,
            paymentType,
            monthYear,
            paymentMethod: paymentMethod || 'Cash',
            remarks,
            description,
            receiptNo,
            receiptUrl,
            recordedBy: req.user._id // Taken from protect middleware
        });

        res.status(201).json({
            message: 'Payment recorded successfully',
            payment
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all payments (With Member details)
// @route   GET /api/payments
// @access  Private (Admin & Treasurer only)
const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('member', 'fullName membershipNo nic')
            .populate('recordedBy', 'fullName role')
            .sort({ createdAt: -1 }); // Latest payments first

        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get payments for a specific member
// @route   GET /api/payments/member/:memberId
// @access  Private (Logged in Member / Admin / Treasurer)
const getMemberPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ member: req.params.memberId })
            .populate('recordedBy', 'fullName role')
            .sort({ createdAt: -1 });

        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// backend/controllers/paymentController.js

// @desc    Get logged in member's payments
// @route   GET /api/payments/my-payments
// @access  Private (Logged-in Member)
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ member: req.user._id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching your payments', error: error.message });
  }
};

// @desc    Member submits a payment receipt for approval
// @route   POST /api/payments/submit
// @access  Private (Logged-in Member)
const submitMemberPayment = async (req, res) => {
  try {
    const { amount, paymentType, monthYear, paymentMethod, remarks } = req.body;

    const receiptUrl = req.file ? `/uploads/receipts/${req.file.filename}` : null;
    const receiptNo = `REC-${Date.now()}`;

    const newPayment = new Payment({
      member: req.user._id, // Logged in user's ID
      amount,
      paymentType,
      monthYear,
      paymentMethod: paymentMethod || 'Bank Transfer',
      remarks: remarks || 'Submitted by Member',
      receiptNo,
      receiptUrl,
      recordedBy: req.user._id,
      status: 'Pending' // Requires Treasurer/Admin Approval
    });

    const savedPayment = await newPayment.save();
    res.status(201).json(savedPayment);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting payment', error: error.message });
  }
};

// @desc    Admin/Treasurer approve or reject a member payment
// @route   PUT /api/payments/:id/status
// @access  Private (Admin & Treasurer)
const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'Approved' or 'Rejected'
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    payment.status = status;
    await payment.save();

    res.json({ message: `Payment ${status} successfully`, payment });
  } catch (error) {
    res.status(500).json({ message: 'Error updating payment status', error: error.message });
  }
};

module.exports = {
    createPayment,
    getAllPayments,
    getMemberPayments,
    getMyPayments,
    submitMemberPayment,
    updatePaymentStatus
};