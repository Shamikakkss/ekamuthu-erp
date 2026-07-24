import React, { useState, useEffect } from 'react';
import API from '../api';
import { 
    DollarSign, PlusCircle, Search, AlertCircle, CheckCircle, 
    CreditCard, Calendar, AlertTriangle, Check, Paperclip, Eye, 
    FileText, X, Download, Printer 
} from 'lucide-react';
import { generateReceiptPDF, generateFinancialReportPDF } from '../utils/generatePDF';

const Payments = () => {
    const currentYear = new Date().getFullYear(); // 2026
    const currentMonthStr = new Date().toISOString().slice(0, 7); // e.g. '2026-07'

    const monthsList = [
        { label: 'Jan', value: `${currentYear}-01` },
        { label: 'Feb', value: `${currentYear}-02` },
        { label: 'Mar', value: `${currentYear}-03` },
        { label: 'Apr', value: `${currentYear}-04` },
        { label: 'May', value: `${currentYear}-05` },
        { label: 'Jun', value: `${currentYear}-06` },
        { label: 'Jul', value: `${currentYear}-07` },
        { label: 'Aug', value: `${currentYear}-08` },
        { label: 'Sep', value: `${currentYear}-09` },
        { label: 'Oct', value: `${currentYear}-10` },
        { label: 'Nov', value: `${currentYear}-11` },
        { label: 'Dec', value: `${currentYear}-12` },
    ];

    // States
    const [payments, setPayments] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [previewReceipt, setPreviewReceipt] = useState(null); // Receipt preview state

    // Form State
    const [formData, setFormData] = useState({
        memberId: '',
        amountPerMonth: 500,
        finePerLateMonth: 100,
        paymentType: 'Monthly Subscription',
        selectedMonths: [],
        paymentMethod: 'Cash',
        remarks: ''
    });

    const [receiptFile, setReceiptFile] = useState(null);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    // Fetch Payments and Members
    const fetchData = async () => {
        try {
            const [paymentsRes, membersRes] = await Promise.allSettled([
                API.get('/payments'),
                API.get('/members')
            ]);

            if (paymentsRes.status === 'fulfilled') {
                setPayments(paymentsRes.value.data || []);
            } else {
                console.error('Error fetching payments:', paymentsRes.reason);
            }

            if (membersRes.status === 'fulfilled') {
                setMembers(membersRes.value.data || []);
            } else {
                console.error('Error fetching members:', membersRes.reason);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Get list of months already paid by the selected member
    const getMemberPaidMonths = (memberId) => {
        if (!memberId) return [];
        return (Array.isArray(payments) ? payments : [])
            .filter(p => (p.member?._id === memberId || p.member === memberId) && 
                        (p.paymentType === 'Monthly Subscription' || p.type === 'Monthly Subscription') && 
                        p.monthYear)
            .map(p => p.monthYear);
    };

    const alreadyPaidMonths = getMemberPaidMonths(formData.memberId);

    // Auto Select Next Unpaid Month on Member Change
    const handleMemberChange = (memberId) => {
        const paidMonths = getMemberPaidMonths(memberId);
        const nextUnpaidMonthObj = monthsList.find(m => !paidMonths.includes(m.value));
        const initialSelected = nextUnpaidMonthObj ? [nextUnpaidMonthObj.value] : [];

        setFormData(prev => ({
            ...prev,
            memberId: memberId,
            selectedMonths: initialSelected
        }));
    };

    // Toggle month selection
    const handleMonthToggle = (monthVal) => {
        if (alreadyPaidMonths.includes(monthVal)) return;

        let updatedMonths = [...formData.selectedMonths];
        if (updatedMonths.includes(monthVal)) {
            if (updatedMonths.length > 1) {
                updatedMonths = updatedMonths.filter(m => m !== monthVal);
            }
        } else {
            updatedMonths.push(monthVal);
        }
        updatedMonths.sort();
        setFormData({ ...formData, selectedMonths: updatedMonths });
    };

    // Late Months & Amounts Calculation
    const lateMonthsCount = formData.paymentType === 'Monthly Subscription' 
        ? formData.selectedMonths.filter(m => m < currentMonthStr).length 
        : 0;

    const subTotal = (Number(formData.amountPerMonth) || 0) * formData.selectedMonths.length;
    const fineTotal = lateMonthsCount * (Number(formData.finePerLateMonth) || 0);
    const grandTotal = subTotal + fineTotal;

    // Handle File Input Change
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setFormError('File size should not exceed 5MB');
                return;
            }
            setReceiptFile(file);
            setFormError('');
        }
    };

    // Handle Form Submission (FormData for File Upload)
    const handleRecordPayment = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (!formData.memberId) {
            setFormError('Please select a member.');
            return;
        }

        if (formData.selectedMonths.length === 0) {
            setFormError('Please select at least one month.');
            return;
        }

        if (formData.paymentMethod === 'Bank Transfer' && !receiptFile) {
            setFormError('Please attach the payment receipt for Bank Transfers.');
            return;
        }

        try {
            const paymentPromises = [];

            // Submit each month record
            formData.selectedMonths.forEach(month => {
                const isLate = month < currentMonthStr;
                const autoRemark = formData.remarks || `Monthly Subscription - ${month}${isLate ? ' (Late Paid)' : ''}`;

                // Create FormData to handle file attachments
                const payFormData = new FormData();
                payFormData.append('memberId', formData.memberId);
                payFormData.append('amount', formData.amountPerMonth);
                payFormData.append('paymentType', formData.paymentType);
                payFormData.append('monthYear', month);
                payFormData.append('paymentMethod', formData.paymentMethod);
                payFormData.append('remarks', autoRemark);

                if (receiptFile) {
                    payFormData.append('receipt', receiptFile);
                }

                paymentPromises.push(API.post('/payments', payFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }));

                // Auto Record Fine Entry if Overdue
                if (formData.paymentType === 'Monthly Subscription' && isLate && formData.finePerLateMonth > 0) {
                    const fineFormData = new FormData();
                    fineFormData.append('memberId', formData.memberId);
                    fineFormData.append('amount', formData.finePerLateMonth);
                    fineFormData.append('paymentType', 'Fine');
                    fineFormData.append('monthYear', month);
                    fineFormData.append('paymentMethod', formData.paymentMethod);
                    fineFormData.append('remarks', `Late Fee - Delayed Subscription for ${month}`);
                    if (receiptFile) fineFormData.append('receipt', receiptFile);

                    paymentPromises.push(API.post('/payments', fineFormData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    }));
                }
            });

            await Promise.all(paymentPromises);

            setFormSuccess(`Payment recorded successfully!`);
            
            // Reset Form
            setFormData({
                memberId: '',
                amountPerMonth: 500,
                finePerLateMonth: 100,
                paymentType: 'Monthly Subscription',
                selectedMonths: [],
                paymentMethod: 'Cash',
                remarks: ''
            });
            setReceiptFile(null);

            fetchData();
            setTimeout(() => setShowModal(false), 1500);
        } catch (err) {
            setFormError(err.response?.data?.message || 'Failed to record payment(s)');
        }
    };

    const filteredPayments = (Array.isArray(payments) ? payments : []).filter(p => 
        (p.member?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.member?.membershipNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.receiptNo || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <DollarSign className="text-emerald-500" /> Payment & Fine Management
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Record and track member subscriptions and receipts.</p>
                </div>
                
                {/* Header Actions Area */}
                <div className="flex items-center gap-3">
                    {/* Export Full Financial Report PDF Button */}
                    <button
                        onClick={() => generateFinancialReportPDF(filteredPayments, 'Payments & Fines Report')}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors border border-slate-600 shadow-md"
                    >
                        <Printer className="w-5 h-5" /> Export PDF Report
                    </button>

                    {/* Record Payment Button */}
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-lg shadow-emerald-900/20"
                    >
                        <PlusCircle className="w-5 h-5" /> Record Payment
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6 relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search by Member Name or Membership No..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                />
            </div>

            {/* Payments Table */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
                {loading ? (
                    <div className="p-8 text-center text-slate-400">Loading payment history...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs border-b border-slate-700">
                                <tr>
                                    <th className="px-6 py-4">Paid Date</th>
                                    <th className="px-6 py-4">Target Month</th>
                                    <th className="px-6 py-4">Member No</th>
                                    <th className="px-6 py-4">Member Name</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Method</th>
                                    <th className="px-6 py-4 text-center">Receipt</th>
                                    <th className="px-6 py-4 text-right">Amount (LKR)</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {filteredPayments.length > 0 ? (
                                    filteredPayments.map((p) => (
                                        <tr key={p._id} className="hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4 text-slate-400 text-xs">
                                                {new Date(p.createdAt || Date.now()).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-emerald-400 font-semibold">
                                                {p.monthYear || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-slate-300">{p.member?.membershipNo || 'N/A'}</td>
                                            <td className="px-6 py-4 font-medium text-white">{p.member?.fullName || 'Unknown Member'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    (p.paymentType || p.type) === 'Fine' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                                                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                                }`}>
                                                    {p.paymentType || p.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-slate-300">
                                                {p.paymentMethod || 'Cash'}
                                            </td>
                                            {/* Receipt Attachment View Column */}
                                            <td className="px-6 py-4 text-center">
                                                {p.receiptUrl ? (
                                                    <button
                                                        onClick={() => setPreviewReceipt(p.receiptUrl)}
                                                        className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-emerald-400 rounded-md text-xs font-medium flex items-center gap-1 mx-auto transition-colors"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" /> View
                                                    </button>
                                                ) : (
                                                    <span className="text-slate-500 text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-white font-mono">
                                                Rs. {Number(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>

                                            {/* Table Actions Column - Download Single Receipt PDF */}
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => generateReceiptPDF(p)}
                                                    title="Download Payment Receipt PDF"
                                                    className="p-1.5 bg-slate-700 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-600"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-8 text-center text-slate-500">
                                            No payment records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Record Payment Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <CreditCard className="text-emerald-500" /> Record Payment
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

                        <form onSubmit={handleRecordPayment} className="space-y-4">
                            {/* Member Dropdown */}
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">Select Member</label>
                                <select
                                    required
                                    value={formData.memberId}
                                    onChange={(e) => handleMemberChange(e.target.value)}
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

                            {/* Payment Type */}
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">Payment Type</label>
                                <select
                                    value={formData.paymentType}
                                    onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                                >
                                    <option value="Monthly Subscription">Monthly Subscription</option>
                                    <option value="Fine">Fine Only (දඩ මුදල පමණක්)</option>
                                    <option value="Admission Fee">Admission Fee</option>
                                </select>
                            </div>

                            {/* Dynamic Month Selector */}
                            {formData.paymentType === 'Monthly Subscription' && (
                                <div>
                                    <label className="block text-xs font-medium text-emerald-400 mb-2 flex items-center justify-between">
                                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Target Months ({currentYear})</span>
                                        {formData.memberId && (
                                            <span className="text-[10px] text-slate-400 font-normal">
                                                Paid: {alreadyPaidMonths.length} month(s)
                                            </span>
                                        )}
                                    </label>
                                    <div className="grid grid-cols-4 gap-2 bg-slate-900 p-3 rounded-lg border border-slate-700">
                                        {monthsList.map((m) => {
                                            const isPaid = alreadyPaidMonths.includes(m.value);
                                            const isSelected = formData.selectedMonths.includes(m.value);
                                            const isLate = m.value < currentMonthStr;

                                            return (
                                                <button
                                                    type="button"
                                                    key={m.value}
                                                    disabled={isPaid}
                                                    onClick={() => handleMonthToggle(m.value)}
                                                    className={`py-1.5 px-2 rounded-md text-xs font-medium transition-all flex flex-col items-center justify-center relative ${
                                                        isPaid 
                                                            ? 'bg-slate-800/40 text-slate-600 border border-slate-800/80 cursor-not-allowed' 
                                                            : isSelected 
                                                                ? isLate ? 'bg-amber-600 text-white shadow-md' : 'bg-emerald-600 text-white shadow-md'
                                                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                                    }`}
                                                >
                                                    <span className="flex items-center gap-1">
                                                        {m.label}
                                                        {isPaid && <Check className="w-3 h-3 text-emerald-500" />}
                                                    </span>
                                                    {isPaid ? (
                                                        <span className="text-[8px] text-emerald-500 font-bold">PAID</span>
                                                    ) : isLate ? (
                                                        <span className="text-[9px] opacity-80">(Overdue)</span>
                                                    ) : null}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Late Fine Configuration Panel */}
                            {lateMonthsCount > 0 && formData.paymentType === 'Monthly Subscription' && (
                                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg text-xs space-y-2">
                                    <div className="flex items-center gap-2 text-amber-400 font-semibold">
                                        <AlertTriangle className="w-4 h-4" /> Overdue Months Selected ({lateMonthsCount})
                                    </div>
                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-slate-300">Fine rate per overdue month (LKR):</span>
                                        <input
                                            type="number" min="0"
                                            value={formData.finePerLateMonth}
                                            onChange={(e) => setFormData({ ...formData, finePerLateMonth: e.target.value })}
                                            className="w-24 bg-slate-900 border border-amber-500/50 rounded px-2 py-1 text-right text-amber-300 font-mono focus:outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Amount & Method */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Amount Per Month (LKR)</label>
                                    <input
                                        type="number" required min="1"
                                        value={formData.amountPerMonth}
                                        onChange={(e) => setFormData({ ...formData, amountPerMonth: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Payment Method</label>
                                    <select
                                        value={formData.paymentMethod}
                                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                    </select>
                                </div>
                            </div>

                            {/* Receipt File Upload Field */}
                            {formData.paymentMethod === 'Bank Transfer' && (
                                <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                                    <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                                        <Paperclip className="w-3.5 h-3.5 text-emerald-400" /> Upload Bank Slip / Receipt (JPG, PNG, PDF)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,application/pdf"
                                        onChange={handleFileChange}
                                        className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 file:cursor-pointer cursor-pointer"
                                    />
                                    {receiptFile && (
                                        <p className="text-[11px] text-emerald-400 mt-1 font-mono flex items-center gap-1">
                                            ✓ Selected: {receiptFile.name}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Total Auto Calculation Box */}
                            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-700 text-xs space-y-1.5">
                                <div className="flex justify-between text-slate-400">
                                    <span>Selected Months:</span>
                                    <span className="text-white font-medium">{formData.selectedMonths.length} Month(s)</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Subscription Subtotal:</span>
                                    <span className="font-mono text-white">Rs. {subTotal.toLocaleString()}</span>
                                </div>
                                {lateMonthsCount > 0 && (
                                    <div className="flex justify-between text-amber-400 font-medium">
                                        <span>Late Fines ({lateMonthsCount} Mo × Rs. {formData.finePerLateMonth}):</span>
                                        <span className="font-mono">+ Rs. {fineTotal.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="border-t border-slate-800 pt-1.5 flex justify-between items-center text-sm font-bold">
                                    <span className="text-white">Total Amount to Pay:</span>
                                    <span className="font-mono text-emerald-400 text-base">
                                        Rs. {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
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
                                    disabled={formData.selectedMonths.length === 0}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium"
                                >
                                    Submit Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Receipt Preview Modal */}
            {previewReceipt && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full p-4 relative shadow-2xl">
                        <button
                            onClick={() => setPreviewReceipt(null)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-white bg-slate-700/50 p-1.5 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                            <FileText className="text-emerald-500" /> Payment Receipt Preview
                        </h3>
                        <div className="bg-slate-900 rounded-lg p-2 max-h-[75vh] overflow-y-auto flex justify-center items-center">
                            {previewReceipt.endsWith('.pdf') ? (
                                <iframe src={previewReceipt} className="w-full h-[60vh] rounded-lg" title="Receipt PDF" />
                            ) : (
                                <img src={previewReceipt} alt="Receipt Slip" className="max-w-full max-h-[70vh] object-contain rounded-lg" />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payments;