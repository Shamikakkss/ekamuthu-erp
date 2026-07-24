const express = require('express');
const router = express.Router();
const { submitClaim, getAllClaims, updateClaimStatus } = require('../controllers/claimController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Submit a claim (Any logged in member)
router.post('/', protect, submitClaim);

// Get all claims (Admin & Treasurer only)
router.get('/', protect, authorize('Admin', 'Treasurer'), getAllClaims);

// Update claim status (Admin & Treasurer only)
router.put('/:id/status', protect, authorize('Admin', 'Treasurer'), updateClaimStatus);

module.exports = router;