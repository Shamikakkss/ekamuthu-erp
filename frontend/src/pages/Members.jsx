import React, { useState, useEffect } from 'react';
import API from '../api'; // Custom Axios instance with base URL and JWT headers configured
import { UserPlus, Users, Search, AlertCircle, CheckCircle } from 'lucide-react'; // Modern UI Icons

const Members = () => {
    // -----------------------------------------------------------------
    // 1. STATES
    // -----------------------------------------------------------------
    const [members, setMembers] = useState([]); // Stores the list of members retrieved from the database
    const [loading, setLoading] = useState(true); // Manages loading spinner state during API call
    const [searchTerm, setSearchTerm] = useState(''); // Stores user search input for live filtering
    const [showModal, setShowModal] = useState(false); // Controls the visibility of the Add Member modal

    // Form state object to store new member details during input
    const [formData, setFormData] = useState({
        fullName: '',
        nic: '',
        phone: '',
        address: '',
        password: '',
        role: 'Member'
    });

    const [formError, setFormError] = useState(''); // Stores registration error messages
    const [formSuccess, setFormSuccess] = useState(''); // Stores registration success messages

    // -----------------------------------------------------------------
    // 2. BACKEND API CALLS & LOGIC
    // -----------------------------------------------------------------

    // Fetch all registered members from backend endpoint (GET /api/members)
    const fetchMembers = async () => {
        try {
            const { data } = await API.get('/members');
            setMembers(data); // Save retrieved data into members state
        } catch (err) {
            console.error('Error fetching members:', err);
        } finally {
            setLoading(false); // Stop loading indicator regardless of success or failure
        }
    };

    // Execute fetchMembers once when the component mounts
    useEffect(() => {
        fetchMembers();
    }, []);

    // Handle form submission to register a new member (POST /api/auth/register)
    const handleRegister = async (e) => {
        e.preventDefault(); // Prevent default page refresh on form submission
        setFormError('');
        setFormSuccess('');

        try {
            await API.post('/auth/register', formData); // Submit form data to registration endpoint
            setFormSuccess('Member registered successfully!'); // Display success feedback
            setFormData({ fullName: '', nic: '', phone: '', address: '', password: '', role: 'Member' }); // Reset form fields
            fetchMembers(); // Refresh the table list immediately with the new data
            setTimeout(() => setShowModal(false), 1500); // Auto-close modal after 1.5 seconds
        } catch (err) {
            // Display backend error response message if registration fails
            setFormError(err.response?.data?.message || 'Failed to register member');
        }
    };

    // Real-time filtering logic based on member name, NIC, or membership number
    const filteredMembers = members.filter(m => 
        m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.nic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.membershipNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // -----------------------------------------------------------------
    // 3. UI RENDER
    // -----------------------------------------------------------------
    return (
        <div className="p-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Users className="text-emerald-500" /> Member Management
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">View and manage registered society members.</p>
                </div>
                {/* Button to open Add New Member Modal */}
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-lg shadow-emerald-900/20"
                >
                    <UserPlus className="w-5 h-5" /> Add New Member
                </button>
            </div>

            {/* Live Search Input Box */}
            <div className="mb-6 relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search by Name, NIC, or Member No..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} // Update state on user input
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                />
            </div>

            {/* Members Data Table */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
                {loading ? (
                    <div className="p-8 text-center text-slate-400">Loading members list...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs border-b border-slate-700">
                                <tr>
                                    <th className="px-6 py-4">Member No</th>
                                    <th className="px-6 py-4">Full Name</th>
                                    <th className="px-6 py-4">NIC</th>
                                    <th className="px-6 py-4">Phone</th>
                                    <th className="px-6 py-4">Role</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {filteredMembers.length > 0 ? (
                                    // Iterate over filtered members array and map to table rows
                                    filteredMembers.map((m) => (
                                        <tr key={m._id} className="hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4 font-mono text-emerald-400">{m.membershipNo}</td>
                                            <td className="px-6 py-4 font-medium text-white">{m.fullName}</td>
                                            <td className="px-6 py-4">{m.nic}</td>
                                            <td className="px-6 py-4">{m.phone}</td>
                                            <td className="px-6 py-4">
                                                {/* Role Badge with dynamic styling */}
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    m.role === 'Admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' :
                                                    m.role === 'Treasurer' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                                                    'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                                }`}>
                                                    {m.role}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                            No members found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Registration Modal Overlay */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-4">Register New Member</h2>

                        {/* Error Alert Box */}
                        {formError && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4" /> {formError}
                            </div>
                        )}

                        {/* Success Alert Box */}
                        {formSuccess && (
                            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2 text-emerald-400 text-sm">
                                <CheckCircle className="w-4 h-4" /> {formSuccess}
                            </div>
                        )}

                        {/* Member Registration Form */}
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                                <input
                                    type="text" required
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">NIC Number</label>
                                    <input
                                        type="text" required
                                        value={formData.nic}
                                        onChange={(e) => setFormData({...formData, nic: e.target.value})}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                                    <input
                                        type="text" required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">Address</label>
                                <input
                                    type="text" required
                                    value={formData.address}
                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                                    <input
                                        type="password" required
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                                    >
                                        <option value="Member">Member</option>
                                        <option value="Treasurer">Treasurer</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                            </div>

                            {/* Form Action Buttons */}
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)} // Close modal
                                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors text-sm font-medium"
                                >
                                    Save Member
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Members;