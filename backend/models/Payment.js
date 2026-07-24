const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true // Reference to the User who made the payment
    },
    amount: {
        type: Number,
        required: true
    },
    paymentType: {
        type: String,
        enum: ['MonthlyFee', 'Fine', 'Donation', 'Other'],
        required: true
    },
    monthYear: {
        type: String, // e.g. "2026-07" (for tracking monthly subscriptions)
        required: true
    },
    description: {
        type: String // Optional note (e.g. "Absent fine for June meeting")
    },
    receiptNo: {
        type: String,
        required: true,
        unique: true
    },
    receiptUrl: {
        type: String, 
        default: null // Stores the uploaded receipt file path/URL (from Multer)
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true // Treasurer or Admin who accepted/verified the payment
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);