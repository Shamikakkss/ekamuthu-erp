import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LogOut, Users, LayoutDashboard, DollarSign, FileText,
    TrendingUp, Clock, ArrowUpRight, CreditCard, CheckCircle, XCircle
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import Members from './Members';
import Payments from './Payments';
import Claims from './Claims';
import { getDashboardStats, updatePaymentStatus } from '../api';

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('userInfo') || '{}');

    // Tab state based on URL path
    const getTabFromPath = () => {
        const path = location.pathname;
        if (path.includes('/members')) return 'members';
        if (path.includes('/payments')) return 'payments';
        if (path.includes('/claims')) return 'claims';
        return 'overview';
    };

    const [activeTab, setActiveTab] = useState(getTabFromPath());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setActiveTab(getTabFromPath());
    }, [location.pathname]);

    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
        if (tabName === 'overview') {
            navigate('/dashboard');
        } else {
            navigate(`/dashboard/${tabName}`);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    // Overview Analytics State
    const [stats, setStats] = useState({
        totalMembers: 0,
        totalRevenue: 0,
        thisMonthRevenue: 0,
        pendingApprovals: 0
    });

    const [recentPayments, setRecentPayments] = useState([]);

    // Analytics Chart Data
    const [monthlyData, setMonthlyData] = useState([]);

    const [methodData, setMethodData] = useState([
        { name: 'Cash', value: 60 },
        { name: 'Bank Transfer', value: 40 },
    ]);

    const COLORS = ['#10b981', '#3b82f6'];

    // Quick Status Update for Recent Payments Table
    const handleQuickStatusUpdate = async (paymentId, newStatus) => {
        try {
            await updatePaymentStatus(paymentId, newStatus);
            setRecentPayments(prev =>
                prev.map(p => p._id === paymentId ? { ...p, status: newStatus } : p)
            );
            // Refresh dashboard data to update total revenue / pending counts
            fetchDashboardData();
        } catch (err) {
            console.error('Error updating payment status:', err);
        }
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const data = await getDashboardStats();

            if (data) {
                if (data.stats) setStats(data.stats);
                if (data.recentPayments) setRecentPayments(data.recentPayments);
                if (data.monthlyChartData) setMonthlyData(data.monthlyChartData);
                if (data.methodData) setMethodData(data.methodData);
            }
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'overview') {
            fetchDashboardData();
        }
    }, [activeTab]);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col justify-between hidden md:flex">
                <div>
                    <div className="p-6 border-b border-slate-700">
                        <h1 className="text-xl font-bold text-white">Ekamuthu<span className="text-emerald-500">ERP</span></h1>
                        <p className="text-xs text-slate-400 mt-1">Community Aid Portal</p>
                    </div>

                    <nav className="p-4 space-y-2">
                        <button
                            onClick={() => handleTabChange('overview')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                                }`}
                        >
                            <LayoutDashboard className="w-5 h-5" /> Overview
                        </button>

                        <button
                            onClick={() => handleTabChange('members')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'members' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                                }`}
                        >
                            <Users className="w-5 h-5" /> Members
                        </button>

                        <button
                            onClick={() => handleTabChange('payments')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'payments' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                                }`}
                        >
                            <DollarSign className="w-5 h-5" /> Payments
                        </button>

                        <button
                            onClick={() => handleTabChange('claims')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'claims' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                                }`}
                        >
                            <FileText className="w-5 h-5" /> Benefit Claims
                        </button>
                    </nav>
                </div>

                <div className="p-4 border-t border-slate-700">
                    <div className="mb-3 px-2">
                        <p className="text-sm font-medium text-white truncate">{user.fullName || 'User'}</p>
                        <p className="text-xs text-emerald-400 font-semibold">{user.role || 'Member'}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-red-600/10 text-red-400 hover:bg-red-600/20 px-3 py-2 rounded-lg text-sm transition-colors border border-red-500/20"
                    >
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex-1 flex flex-col overflow-y-auto">
                {activeTab === 'overview' && (
                    <div className="p-8 max-w-7xl space-y-8">
                        {/* Welcome Header */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                                <TrendingUp className="text-emerald-500" /> Welcome back, {user.fullName || 'Admin'}! 👋
                            </h2>
                            <p className="text-slate-400 text-sm">System Overview, Revenue Analytics & Quick Actions.</p>
                        </div>

                        {/* Top Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            {/* Total Members */}
                            <div
                                onClick={() => handleTabChange('members')}
                                className="bg-slate-800 border border-slate-700 p-5 rounded-xl shadow-lg relative overflow-hidden cursor-pointer hover:border-emerald-500/50 transition-colors"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Members</p>
                                        <h3 className="text-2xl font-bold text-white mt-1">{stats.totalMembers}</h3>
                                    </div>
                                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg">
                                        <Users className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center text-xs text-emerald-400 font-medium gap-1">
                                    <ArrowUpRight className="w-3.5 h-3.5" /> Manage Members
                                </div>
                            </div>

                            {/* Total Revenue */}
                            <div
                                onClick={() => handleTabChange('payments')}
                                className="bg-slate-800 border border-slate-700 p-5 rounded-xl shadow-lg relative overflow-hidden cursor-pointer hover:border-emerald-500/50 transition-colors"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Revenue</p>
                                        <h3 className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
                                            Rs. {stats.totalRevenue.toLocaleString()}
                                        </h3>
                                    </div>
                                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                                        <DollarSign className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center text-xs text-slate-400 font-medium">
                                    Lifetime Collection
                                </div>
                            </div>

                            {/* This Month Revenue */}
                            <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl shadow-lg relative overflow-hidden">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">This Month</p>
                                        <h3 className="text-2xl font-bold text-white mt-1 font-mono">
                                            Rs. {stats.thisMonthRevenue.toLocaleString()}
                                        </h3>
                                    </div>
                                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg">
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center text-xs text-emerald-400 font-medium gap-1">
                                    <ArrowUpRight className="w-3.5 h-3.5" /> +12% vs last month
                                </div>
                            </div>

                            {/* Pending Slips */}
                            <div
                                onClick={() => handleTabChange('payments')}
                                className="bg-slate-800 border border-slate-700 p-5 rounded-xl shadow-lg relative overflow-hidden cursor-pointer hover:border-amber-500/50 transition-colors"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Pending Slips</p>
                                        <h3 className="text-2xl font-bold text-amber-400 mt-1">{stats.pendingApprovals}</h3>
                                    </div>
                                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center text-xs text-amber-400/80 font-medium">
                                    Requires Approval
                                </div>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Monthly Collection Bar Chart */}
                            <div className="lg:col-span-2 bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-xl">
                                <h3 className="text-lg font-bold text-white mb-4">Monthly Collection Trend (LKR)</h3>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={monthlyData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                            <XAxis dataKey="month" stroke="#94a3b8" />
                                            <YAxis stroke="#94a3b8" />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff' }}
                                                formatter={(value) => [`Rs. ${value.toLocaleString()}`, 'Collection']}
                                            />
                                            <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Payment Method Split */}
                            <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-xl flex flex-col justify-between">
                                <h3 className="text-lg font-bold text-white mb-2">Payment Methods</h3>
                                <div className="h-52 w-full flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={methodData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={75}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {methodData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex justify-center gap-6 text-xs text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Cash (60%)
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Bank Transfer (40%)
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Recent Payments Table */}
                        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Clock className="text-amber-400 w-5 h-5" /> Recent Payments & Pending Approvals
                                </h3>
                                <button
                                    onClick={() => handleTabChange('payments')}
                                    className="text-xs text-emerald-400 hover:underline"
                                >
                                    View All Payments →
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-300">
                                    <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs border-b border-slate-700">
                                        <tr>
                                            <th className="px-4 py-3">Member</th>
                                            <th className="px-4 py-3">Target Month</th>
                                            <th className="px-4 py-3">Method</th>
                                            <th className="px-4 py-3">Amount</th>
                                            <th className="px-4 py-3 text-center">Status</th>
                                            <th className="px-4 py-3 text-center">Quick Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                        {recentPayments.map((p) => (
                                            <tr key={p._id} className="hover:bg-slate-700/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-white">{p.member.fullName}</div>
                                                    <div className="text-xs text-slate-500 font-mono">{p.member.membershipNo}</div>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-emerald-400">{p.monthYear}</td>
                                                <td className="px-4 py-3 text-xs">{p.paymentMethod}</td>
                                                <td className="px-4 py-3 font-mono text-white font-bold">Rs. {p.amount}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${p.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                                                            p.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                                                                'bg-red-500/10 text-red-400 border border-red-500/30'
                                                        }`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {p.status === 'Pending' ? (
                                                        <div className="flex justify-center gap-2">
                                                            <button
                                                                onClick={() => handleQuickStatusUpdate(p._id, 'Approved')}
                                                                className="p-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded transition-colors"
                                                                title="Approve"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleQuickStatusUpdate(p._id, 'Rejected')}
                                                                className="p-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded transition-colors"
                                                                title="Reject"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-500 text-xs">Done</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sub Routes Content Render Area */}
                {activeTab === 'members' && <Members />}
                {activeTab === 'payments' && <Payments />}
                {activeTab === 'claims' && <Claims />}
            </div>
        </div>
    );
};

export default Dashboard;