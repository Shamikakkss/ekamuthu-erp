const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Express Static Folder for uploaded files
app.use('/uploads', express.static('uploads'));

// Routes Imports
const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const claimRoutes = require('./routes/claimRoutes'); // Claim Routes added
const dashboardRoutes = require('./routes/dashboardRoutes');

// API Routes Setup
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/claims', claimRoutes); // Claim API path added
app.use('/api/dashboard', dashboardRoutes);

// Base Test Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to EkamuthuERP API Server!' });
});

// Server Port Setup
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

const path = require('path');

// Express static folder serve කිරීම
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

