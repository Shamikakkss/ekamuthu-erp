const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    membershipNo: {
        type: String,
        required: true,
        unique: true // Unique Membership Identification (e.g. MEM-001)
    },
    fullName: {
        type: String,
        required: true
    },
    nic: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Admin', 'Treasurer', 'Member'],
        default: 'Member'
    },
    status: {
        type: String,
        enum: ['Active', 'Suspended', 'Deceased'],
        default: 'Active'
    },
    // Array of family members / dependents
    dependents: [
        {
            name: { type: String, required: true },
            relationship: { type: String, required: true }, // e.g. Spouse, Child, Parent
            nicOrBc: { type: String }
        }
    ]
}, {
    timestamps: true // Automatically generates createdAt and updatedAt fields
});

module.exports = mongoose.model('User', userSchema);