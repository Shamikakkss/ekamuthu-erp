const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true // The member who is requesting the claim
    },
    deceasedName: {
        type: String,
        required: true // Name of the deceased person
    },
    relationship: {
        type: String,
        required: true // e.g. "Self", "Spouse", "Child", "Parent"
    },
    claimAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Paid'],
        default: 'Pending'
    },
    deathCertificateNo: {
        type: String,
        required: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Admin or Treasurer who approved/rejected
    },
    remarks: {
        type: String // Optional notes by Admin
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Claim', claimSchema);