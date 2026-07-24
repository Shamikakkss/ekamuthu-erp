const Claim = require('../models/Claim');
const User = require('../models/User');

// @desc    Submit a new death claim request
// @route   POST /api/claims
// @access  Private (Logged-in User / Member)
const submitClaim = async (req, res) => {
    try {
        const { deceasedName, relationship, claimAmount, deathCertificateNo } = req.body;

        const claim = await Claim.create({
            member: req.user._id, // Logged in user ID
            deceasedName,
            relationship,
            claimAmount,
            deathCertificateNo
        });

        res.status(201).json({
            message: 'Claim request submitted successfully',
            claim
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all claims
// @route   GET /api/claims
// @access  Private (Admin & Treasurer only)
const getAllClaims = async (req, res) => {
    try {
        const claims = await Claim.find()
            .populate('member', 'fullName membershipNo nic phone')
            .populate('approvedBy', 'fullName role')
            .sort({ createdAt: -1 });

        res.json(claims);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update claim status (Approve / Reject / Paid)
// @route   PUT /api/claims/:id/status
// @access  Private (Admin & Treasurer only)
const updateClaimStatus = async (req, res) => {
    try {
        const { status, remarks } = req.body;

        const claim = await Claim.findById(req.params.id);

        if (!claim) {
            return res.status(404).json({ message: 'Claim not found' });
        }

        claim.status = status || claim.status;
        claim.remarks = remarks || claim.remarks;
        claim.approvedBy = req.user._id;

        const updatedClaim = await claim.save();

        res.json({
            message: `Claim status updated to ${updatedClaim.status}`,
            claim: updatedClaim
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    submitClaim,
    getAllClaims,
    updateClaimStatus
};