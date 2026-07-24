const Payment = require('../models/Payment');
const User = require('../models/User');

// @desc    Record a new payment (Collect cash)
// @route   POST /api/payments
// @access  Private (Admin & Treasurer only)
const createPayment = async (req, res) => {
    try {
        const { memberId, amount, paymentType, monthYear, description } = req.body;

        // Check if member exists
        const member = await User.findById(memberId);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        // Generate a unique receipt number (e.g., REC-1721758923)
        const receiptNo = `REC-${Date.now()}`;

        const payment = await Payment.create({
            member: memberId,
            amount,
            paymentType,
            monthYear,
            description,
            receiptNo,
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

module.exports = {
    createPayment,
    getAllPayments,
    getMemberPayments
};