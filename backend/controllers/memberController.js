const User = require('../models/User');

// @desc    Get all members
// @route   GET /api/members
// @access  Private (Admin & Treasurer only)
const getAllMembers = async (req, res) => {
    try {
        // Fetch all users excluding password field
        const members = await User.find().select('-password');
        res.json(members);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged-in user profile
// @route   GET /api/members/profile
// @access  Private (Logged-in user)
const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllMembers,
    getMyProfile
};