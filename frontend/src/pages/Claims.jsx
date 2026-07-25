import React, { useState, useEffect } from 'react';
import API from '../api';
import { FileText, PlusCircle, Search, AlertCircle, CheckCircle, Clock, Check, X, CreditCard, User, Tag, Calendar } from 'lucide-react';

const Claims = () => {
    const [claims, setClaims] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        memberId: '',
        deceasedName: '',
        relationship: 'Spouse',
        claimAmount: 50000,
        deathCertificateNo: '',
        remarks: ''
    });

    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    // Fetch Claims & Members
    const fetchData = async () => {
        try {
            const [claimsRes, membersRes] = await Promise.allSettled([
                API.get('/claims'),
                API.get('/members')
            ]);
            if (claimsRes.status === 'fulfilled') {
                setClaims(Array.isArray(claimsRes.value.data) ? claimsRes.value.data : []);
            }
            if (membersRes.status === 'fulfilled') {
                setMembers(Array.isArray(membersRes.value.data) ? membersRes.value.data : []);
            }
        } catch (err) {
            console.error('Error fetching claims data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle Submit Claim
    const handleSubmitClaim = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (!formData.memberId) {
            setFormError('Please select a member.');
            return;
        }

        try {
            await API.post('/claims', {
                member: formData.memberId,
                deceasedName: formData.deceasedName,
                relationship: formData.relationship,
                claimAmount: formData.claimAmount,
                deathCertificateNo: formData.deathCertificateNo,
                remarks: formData.remarks
            });

            setFormSuccess('Death benefit claim submitted successfully!');
            
            // Reset Form
            setFormData({
                memberId: '',
                deceasedName: '',
                relationship: 'Spouse',
                claimAmount: 50000,
                deathCertificateNo: '',
                remarks: ''
            });

            fetchData();
            setTimeout(() => setShowModal(false), 1500);
        } catch (err) {
            setFormError(err.response?.data?.message || 'Failed to submit claim.');
        }
    };

    // Update Claim Status (Approve / Reject / Mark as Paid)
    const handleStatusUpdate = async (claimId, newStatus) => {
        try {
            await API.put(`/claims/${claimId}/status`, { status: newStatus });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

    // Filter Claims
    const filteredClaims = (Array.isArray(claims) ? claims : []).filter(c => 
        (c.deceasedName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.member?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.member?.membershipNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.deathCertificateNo || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <FileText className="text-emerald-500" /> Death Benefit Claims Management
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Submit, track, and process death donation requests.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-lg shadow-emerald-900/20"
                >
                    <PlusCircle className="w-5 h-5" /> Submit New Claim
                </button>
            </div>

            {/* Search */}
            <div className="mb-6 relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search by Deceased, Member, or Certificate No..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                />
            </div>

            {/* Claims Table */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
                {loading ? (
                    <div className="p-8 text-center text-slate-400">Loading claims list...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs border-b border-slate-700">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Member Info</th>
                                    <th className="px-6 py-4">Deceased Name</th>
                                    <th className="px-6 py-4">Relation</th>
                                    <th className="px-6 py-4">Death Cert No</th>
                                    <th className="px-6 py-4">Amount (LKR)</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {filteredClaims.length > 0 ? (
                                    filteredClaims.map((c) => (
                                        <tr key={c._id} className="hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4 text-slate-400 text-xs">
                                                {new Date(c.createdAt || Date.now()).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white">{c.member?.fullName || 'Unknown Member'}</div>
                                                <div className="text-xs text-emerald-400 font-mono">{c.member?.membershipNo}</div>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-white">{c.deceasedName}</td>
                                            <td className="px-6 py-4 text-xs">
                                                <span className="px-2 py-0.5 bg-slate-700 rounded text-slate-300">
                                                    {c.relationship}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-400">
                                                {c.deathCertificateNo}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-white font-mono">
                                                Rs. {Number(c.claimAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                                                    c.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                                                    c.status === 'Paid' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                                                    c.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                                                    'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                                }`}>
                                                    {c.status === 'Pending' && <Clock className="w-3 h-3" />}
                                                    {c.status === 'Approved' && <Check className="w-3 h-3" />}
                                                    {c.status === 'Paid' && <CreditCard className="w-3 h-3" />}
                                                    {c.status === 'Rejected' && <X className="w-3 h-3" />}
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-2">
                                                    {c.status === 'Pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(c._id, 'Approved')}
                                                                className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded text-xs font-medium transition-colors"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(c._id, 'Rejected')}
                                                                className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded text-xs font-medium transition-colors"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    {c.status === 'Approved' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(c._id, 'Paid')}
                                                            className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded text-xs font-medium transition-colors"
                                                        >
                                                            Mark Paid
                                                        </button>
                                                    )}
                                                    {c.status === 'Paid' && <span className="text-xs text-slate-500">Completed</span>}
                                                    {c.status === 'Rejected' && <span className="text-xs text-slate-500">Closed</span>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-8 text-center text-slate-500">
                                            No benefit claims found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* New Claim Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <FileText className="text-emerald-500" /> Submit Death Benefit Claim
                        </h2>

                        {formError && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4" /> {formError}
                            </div>
                        )}

                        {formSuccess && (
                            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2 text-emerald-400 text-sm">
                                <CheckCircle className="w-4 h-4" /> {formSuccess}
                            </div>
                        )}

                        <form onSubmit={handleSubmitClaim} className="space-y-4">
                            {/* Member Dropdown */}
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">Requesting Member</label>
                                <select
                                    required
                                    value={formData.memberId}
                                    onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                                >
                                    <option value="">-- Select Member --</option>
                                    {members.map((m) => (
                                        <option key={m._id} value={m._id}>
                                            {m.membershipNo} - {m.fullName} ({m.nic})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Deceased Name */}
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">Deceased Person's Full Name</label>
                                <input
                                    type="text" required
                                    placeholder="Enter full name of deceased"
                                    value={formData.deceasedName}
                                    onChange={(e) => setFormData({ ...formData, deceasedName: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            {/* Relationship & Certificate No */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Relationship</label>
                                    <select
                                        value={formData.relationship}
                                        onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                                    >
                                        <option value="Self">Self</option>
                                        <option value="Spouse">Spouse</option>
                                        <option value="Child">Child</option>
                                        <option value="Parent">Parent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Death Certificate No</label>
                                    <input
                                        type="text" required
                                        placeholder="e.g. DC-998822"
                                        value={formData.deathCertificateNo}
                                        onChange={(e) => setFormData({ ...formData, deathCertificateNo: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            {/* Claim Amount */}
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">Claim Amount (LKR)</label>
                                <input
                                    type="number" required min="1000"
                                    value={formData.claimAmount}
                                    onChange={(e) => setFormData({ ...formData, claimAmount: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            {/* Remarks */}
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">Remarks / Notes (Optional)</label>
                                <textarea
                                    rows="2"
                                    placeholder="Any additional information..."
                                    value={formData.remarks}
                                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                                ></textarea>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-sm font-medium"
                                >
                                    Submit Claim
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Claims;