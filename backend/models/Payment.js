const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentType: {
        type: String,
        required: true
    },
    monthYear: {
        type: String
    },
    paymentMethod: {
        type: String,
        default: 'Cash'
    },
    remarks: {
        type: String
    },
    description: {
        type: String
    },
    receiptNo: {
        type: String,
        unique: true
    },
    receiptUrl: {
        type: String,
        default: null
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Payment approval status for member-submitted payments
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Approved'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);