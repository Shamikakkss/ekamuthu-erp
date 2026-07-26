const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT Token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d' // Token expires in 30 days
    });
};

// @desc    Register a new Member / User
// @route   POST /api/auth/register
// @access  Public (or Admin)
const registerUser = async (req, res) => {
    try {
        const { fullName, nic, phone, address, password, role, dependents } = req.body;

        // Sanitize NIC (remove spaces and convert to uppercase)
        const normalizedNic = nic ? nic.trim().toUpperCase() : '';

        // 1. Check if user already exists with NIC
        const userExists = await User.findOne({ nic: normalizedNic });
        if (userExists) {
            return res.status(400).json({ message: 'User with this NIC already exists' });
        }

        // 2. Auto-generate Membership Number (e.g. MEM-0001, MEM-0002)
        const count = await User.countDocuments();
        const generatedMembershipNo = `MEM-${(count + 1).toString().padStart(4, '0')}`;

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create new user with generated membershipNo
        const user = await User.create({
            membershipNo: generatedMembershipNo, // Auto-generated ID passed here
            fullName,
            nic: normalizedNic,
            phone,
            address,
            password: hashedPassword,
            role: role || 'Member',
            dependents: dependents || []
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                membershipNo: user.membershipNo,
                fullName: user.fullName,
                nic: user.nic,
                role: user.role,
                token: generateToken(user._id, user.role)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate User & Get Token (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { nic, password } = req.body;

        // Sanitize NIC (remove spaces and convert to uppercase)
        const normalizedNic = nic ? nic.trim().toUpperCase() : '';

        // Find user by NIC
        const user = await User.findOne({ nic: normalizedNic });

        // Check user existence & compare password
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                membershipNo: user.membershipNo,
                fullName: user.fullName,
                nic: user.nic,
                role: user.role,
                token: generateToken(user._id, user.role)
            });
        } else {
            res.status(401).json({ message: 'Invalid NIC or Password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser
};