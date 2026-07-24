import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, LayoutDashboard, DollarSign } from 'lucide-react';
import Members from './Members';
import Payments from './Payments'; // Import Payments View Component

const Dashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('userInfo') || '{}');

    // Tab state: 'overview', 'members', or 'payments'
    const [activeTab, setActiveTab] = useState('overview');

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
                            onClick={() => setActiveTab('overview')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === 'overview' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                            }`}
                        >
                            <LayoutDashboard className="w-5 h-5" /> Overview
                        </button>

                        <button
                            onClick={() => setActiveTab('members')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === 'members' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                            }`}
                        >
                            <Users className="w-5 h-5" /> Members
                        </button>

                        <button
                            onClick={() => setActiveTab('payments')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === 'payments' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                            }`}
                        >
                            <DollarSign className="w-5 h-5" /> Payments
                        </button>
                    </nav>
                </div>

                <div className="p-4 border-t border-slate-700">
                    <div className="mb-3 px-2">
                        <p className="text-sm font-medium text-white truncate">{user.fullName}</p>
                        <p className="text-xs text-emerald-400 font-semibold">{user.role}</p>
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
            <div className="flex-1 flex flex-col">
                {activeTab === 'overview' && (
                    <div className="p-8 max-w-7xl">
                        <h2 className="text-2xl font-bold text-white mb-2">Welcome back, {user.fullName}! 👋</h2>
                        <p className="text-slate-400 text-sm mb-8">System Overview & Quick Actions.</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div onClick={() => setActiveTab('members')} className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center gap-4 cursor-pointer hover:border-emerald-500/50 transition-colors">
                                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs uppercase font-semibold">Members</p>
                                    <h3 className="text-xl font-bold text-white mt-1">Manage Database</h3>
                                </div>
                            </div>

                            <div onClick={() => setActiveTab('payments')} className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center gap-4 cursor-pointer hover:border-emerald-500/50 transition-colors">
                                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs uppercase font-semibold">Payments</p>
                                    <h3 className="text-xl font-bold text-white mt-1">Subscriptions & Fines</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'members' && <Members />}
                {activeTab === 'payments' && <Payments />}
            </div>
        </div>
    );
};

export default Dashboard;