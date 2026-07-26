const User = require('../models/User');
const Payment = require('../models/Payment');

// @desc    Get Admin Dashboard Stats & Recent Activity
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        // 1. Total Members Count (Users with role 'Member' or all registered users)
        const totalMembers = await User.countDocuments();

        // 2. Total Approved Revenue
        const totalRevenueResult = await Payment.aggregate([
            { $match: { status: 'Approved' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRevenue = totalRevenueResult[0]?.total || 0;

        // 3. This Month Revenue
        const currentMonthYear = new Date().toISOString().slice(0, 7); // e.g. "2026-07"
        const thisMonthRevenueResult = await Payment.aggregate([
            { 
                $match: { 
                    status: 'Approved',
                    monthYear: currentMonthYear 
                } 
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const thisMonthRevenue = thisMonthRevenueResult[0]?.total || 0;

        // 4. Pending Approvals Count
        const pendingApprovals = await Payment.countDocuments({ status: 'Pending' });

        // 5. Recent 5 Payments
        const recentPayments = await Payment.find()
            .populate('member', 'fullName membershipNo')
            .sort({ createdAt: -1 })
            .limit(5);

        // 6. Monthly Collection Data for Bar Chart
        const monthlyChartData = await Payment.aggregate([
            { $match: { status: 'Approved' } },
            {
                $group: {
                    _id: '$monthYear',
                    amount: { $sum: '$amount' }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 12 }
        ]);

        const formattedChartData = monthlyChartData.map(item => ({
            month: item._id || 'Unknown',
            amount: item.amount
        }));

        // 7. Payment Methods Breakdown
        const methodCounts = await Payment.aggregate([
            { $match: { status: 'Approved' } },
            {
                $group: {
                    _id: '$paymentMethod',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalPaymentsCount = methodCounts.reduce((acc, curr) => acc + curr.count, 0) || 1;
        const methodData = methodCounts.map(item => ({
            name: item._id || 'Cash',
            value: Math.round((item.count / totalPaymentsCount) * 100)
        }));

        res.status(200).json({
            stats: {
                totalMembers,
                totalRevenue,
                thisMonthRevenue,
                pendingApprovals
            },
            recentPayments,
            monthlyChartData: formattedChartData,
            methodData: methodData.length > 0 ? methodData : [
                { name: 'Cash', value: 60 },
                { name: 'Bank Transfer', value: 40 }
            ]
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server Error fetching dashboard stats', error: error.message });
    }
};

module.exports = { getDashboardStats };