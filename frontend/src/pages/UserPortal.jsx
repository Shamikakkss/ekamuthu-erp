import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { 
    CreditCard, 
    FileText, 
    Users, 
    LogOut, 
    PlusCircle, 
    Clock, 
    CheckCircle2, 
    AlertCircle,
    Building2,
    History
} from 'lucide-react';

const UserPortal = () => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            setUserInfo(JSON.parse(storedUser));
        } else {
            navigate('/');
        }
        setLoading(false);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
            {/* Top Navigation Header */}
            <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                                <Building2 className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-white">
                                    Ekamuthu<span className="text-emerald-500">ERP</span>
                                </h1>
                                <p className="text-xs text-slate-400">Community Aid Portal</p>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <nav className="hidden md:flex items-center space-x-1">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    activeTab === 'overview'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('payments')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    activeTab === 'payments'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                            >
                                Payment Submissions
                            </button>
                            <button
                                onClick={() => setActiveTab('claims')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    activeTab === 'claims'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                            >
                                Benefit Claims
                            </button>
                        </nav>

                        {/* User Profile & Logout */}
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:block text-right">
                                <div className="text-sm font-semibold text-white">
                                    {userInfo?.fullName || userInfo?.name || 'Member'}
                                </div>
                                <div className="text-xs text-emerald-400 font-medium">
                                    {userInfo?.nic || 'Verified Member'}
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Hero Welcome Banner */}
                <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <span className="inline-block bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                                Member Dashboard
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                Welcome back, {userInfo?.fullName || 'Member'}! 👋
                            </h2>
                            <p className="text-slate-400 text-sm mt-1">
                                Access your community mutual aid services, review payment statuses, and claim benefits.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button 
                                onClick={() => setActiveTab('payments')}
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg transition-all"
                            >
                                <PlusCircle className="w-4 h-4" />
                                Pay Monthly Subscription
                            </button>
                        </div>
                    </div>
                </div>

                {/* Status Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Paid Records</span>
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                <CreditCard className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-white">Rs. 0.00</div>
                        <p className="text-xs text-slate-500 mt-1">Updated in real-time</p>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pending Approvals</span>
                            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                                <Clock className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-amber-400">0 Pending</div>
                        <p className="text-xs text-slate-500 mt-1">Payments awaiting treasurer check</p>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Registered Dependents</span>
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-white">0 Persons</div>
                        <p className="text-xs text-slate-500 mt-1">Eligible for welfare claims</p>
                    </div>
                </div>

                {/* Sub-Section Content based on Active Tab */}
                {activeTab === 'overview' && (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <History className="w-5 h-5 text-emerald-500" />
                            Recent Activities & Announcements
                        </h3>
                        <div className="text-center py-12 border border-dashed border-slate-800 rounded-lg">
                            <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400 text-sm">No recent transactions or system updates available.</p>
                        </div>
                    </div>
                )}

                {activeTab === 'payments' && (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-white">Payment Submission History</h3>
                            <button className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors">
                                + Submit New Receipt
                            </button>
                        </div>
                        <div className="text-center py-12 border border-dashed border-slate-800 rounded-lg">
                            <p className="text-slate-400 text-sm">You have not submitted any online payments yet.</p>
                        </div>
                    </div>
                )}

                {activeTab === 'claims' && (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-white">Benefit Claim Requests</h3>
                            <button className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors">
                                + Request New Claim
                            </button>
                        </div>
                        <div className="text-center py-12 border border-dashed border-slate-800 rounded-lg">
                            <p className="text-slate-400 text-sm">No welfare or benefit claims submitted.</p>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-800 bg-slate-900/40 py-6 text-center text-xs text-slate-500 mt-auto">
                Ekamuthu Community ERP Management System &copy; {new Date().getFullYear()}
            </footer>
        </div>
    );
};

export default UserPortal;