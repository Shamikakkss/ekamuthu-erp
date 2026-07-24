import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { LogOut, Users, LayoutDashboard, DollarSign, FileText } from 'lucide-react';
import Members from './Members';
import Payments from './Payments';
import Claims from './Claims';

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
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === 'overview' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                            }`}
                        >
                            <LayoutDashboard className="w-5 h-5" /> Overview
                        </button>

                        <button
                            onClick={() => handleTabChange('members')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === 'members' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                            }`}
                        >
                            <Users className="w-5 h-5" /> Members
                        </button>

                        <button
                            onClick={() => handleTabChange('payments')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === 'payments' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                            }`}
                        >
                            <DollarSign className="w-5 h-5" /> Payments
                        </button>

                        <button
                            onClick={() => handleTabChange('claims')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === 'claims' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
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
                    <div className="p-8 max-w-7xl">
                        <h2 className="text-2xl font-bold text-white mb-2">Welcome back, {user.fullName || 'User'}! 👋</h2>
                        <p className="text-slate-400 text-sm mb-8">System Overview & Quick Actions.</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div onClick={() => handleTabChange('members')} className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center gap-4 cursor-pointer hover:border-emerald-500/50 transition-colors">
                                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs uppercase font-semibold">Members</p>
                                    <h3 className="text-xl font-bold text-white mt-1">Manage Database</h3>
                                </div>
                            </div>

                            <div onClick={() => handleTabChange('payments')} className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center gap-4 cursor-pointer hover:border-emerald-500/50 transition-colors">
                                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs uppercase font-semibold">Payments</p>
                                    <h3 className="text-xl font-bold text-white mt-1">Subscriptions & Fines</h3>
                                </div>
                            </div>

                            <div onClick={() => handleTabChange('claims')} className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center gap-4 cursor-pointer hover:border-emerald-500/50 transition-colors">
                                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs uppercase font-semibold">Death Claims</p>
                                    <h3 className="text-xl font-bold text-white mt-1">Process Claims</h3>
                                </div>
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