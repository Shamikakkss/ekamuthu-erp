const express = require('express');
const router = express.Router();
const { getAllMembers, getMyProfile } = require('../controllers/memberController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Route to get logged in user's profile
router.get('/profile', protect, getMyProfile);

// Route to get all members (Only for Admin and Treasurer)
router.get('/', protect, authorize('Admin', 'Treasurer'), getAllMembers);

module.exports = router;