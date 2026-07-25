import React, { useState, useEffect } from 'react';
import API from '../api';
import {
  X, Upload, CheckCircle2, Loader2, AlertCircle,
  Calendar, Check, AlertTriangle, CreditCard, Lock, ShieldCheck
} from 'lucide-react';

const MemberPaymentModal = ({ isOpen, onClose, onSuccess, paidMonthsHistory = [] }) => {
  const currentYear = new Date().getFullYear();
  const currentMonthStr = new Date().toISOString().slice(0, 7);

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

  const [selectedMonths, setSelectedMonths] = useState([]);
  const [amountPerMonth] = useState(500);
  const [finePerLateMonth] = useState(100);

  // Payment Options: 'Card' vs 'Bank Transfer'
  const [paymentMethod, setPaymentMethod] = useState('Card');

  // Card Form Inputs (Dummy / Demo for UI Integration)
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expDate: '',
    cvc: '',
    cardName: ''
  });

  const [receiptFile, setReceiptFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const nextUnpaid = monthsList.find(m => !paidMonthsHistory.includes(m.value));
      setSelectedMonths(nextUnpaid ? [nextUnpaid.value] : []);
      setError('');
      setReceiptFile(null);
      setPreviewUrl(null);
    }
  }, [isOpen, paidMonthsHistory]);

  if (!isOpen) return null;

  const handleMonthToggle = (monthVal) => {
    if (paidMonthsHistory.includes(monthVal)) return;

    let updated = [...selectedMonths];
    if (updated.includes(monthVal)) {
      updated = updated.filter(m => m !== monthVal);
    } else {
      updated.push(monthVal);
    }
    updated.sort();
    setSelectedMonths(updated);
  };

  const lateMonthsCount = selectedMonths.filter(m => m < currentMonthStr).length;
  const subTotal = selectedMonths.length * amountPerMonth;
  const fineTotal = lateMonthsCount * finePerLateMonth;
  const grandTotal = subTotal + fineTotal;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }
      setReceiptFile(file);
      setError('');
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (selectedMonths.length === 0) {
        setError('Please select at least one month.');
        return;
    }

    // Validation for Bank Slip Method
    if (paymentMethod === 'Bank Transfer' && !receiptFile) {
        setError('Please attach your payment receipt slip.');
        return;
    }

    // Validation for Card Method
    if (paymentMethod === 'Card') {
        if (!cardData.cardNumber || !cardData.expDate || !cardData.cvc) {
            setError('Please enter complete Card details.');
            return;
        }
    }

    try {
        setLoading(true);

        const paymentStatus = paymentMethod === 'Card' ? 'Approved' : 'Pending';
        const formattedMethod = paymentMethod === 'Card' ? 'Credit/Debit Card' : 'Bank Transfer';

        // Promises array to hold both Subscription & Late Fine requests
        const paymentPromises = [];

        selectedMonths.forEach(month => {
            const isLate = month < currentMonthStr;

            // 1. SUBSCRIPTION RECORD (වෙනම Record එකක්)
            const subFormData = new FormData();
            subFormData.append('monthYear', month);
            subFormData.append('amount', amountPerMonth.toString()); // LKR 500
            subFormData.append('paymentType', 'Monthly Subscription');
            subFormData.append('paymentMethod', formattedMethod);
            subFormData.append('status', paymentStatus);
            subFormData.append('remarks', `Monthly Subscription for ${month}`);

            if (receiptFile) {
                subFormData.append('receipt', receiptFile);
            }

            paymentPromises.push(
                API.post('/payments/submit', subFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
            );

            // 2. LATE FINE RECORD (මාසය Overdue නම් පමණක් වෙනම Record එකක්)
            if (isLate && Number(finePerLateMonth) > 0) {
                const fineFormData = new FormData();
                fineFormData.append('monthYear', month);
                fineFormData.append('amount', finePerLateMonth.toString()); // LKR 100
                fineFormData.append('paymentType', 'Late Fine'); // Type එක 'Late Fine' විදියට සටහන් වේ
                fineFormData.append('paymentMethod', formattedMethod);
                fineFormData.append('status', paymentStatus);
                fineFormData.append('remarks', `Late Payment Fine for ${month}`);

                if (receiptFile) {
                    fineFormData.append('receipt', receiptFile);
                }

                paymentPromises.push(
                    API.post('/payments/submit', fineFormData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    })
                );
            }
        });

        // Batch execution for all separate records
        await Promise.all(paymentPromises);

        if (onSuccess) onSuccess();

    } catch (err) {
        console.error('Payment submit error:', err);
        setError(err.response?.data?.message || 'Failed to process payment. Try again.');
    } finally {
        setLoading(false);
    }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50 shrink-0">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-500" />
            Pay Monthly Subscription
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Target Months Grid */}
          <div>
            <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Target Months ({currentYear})
              </span>
            </label>

            <div className="grid grid-cols-4 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
              {monthsList.map((m) => {
                const isPaid = paidMonthsHistory.includes(m.value);
                const isSelected = selectedMonths.includes(m.value);
                const isLate = m.value < currentMonthStr;

                return (
                  <button
                    type="button"
                    key={m.value}
                    disabled={isPaid}
                    onClick={() => handleMonthToggle(m.value)}
                    className={`py-2 px-1 rounded-lg text-xs font-medium transition-all flex flex-col items-center justify-center ${isPaid
                        ? 'bg-slate-900 text-slate-600 border border-slate-800/60 cursor-not-allowed'
                        : isSelected
                          ? isLate ? 'bg-amber-600 text-white shadow-md' : 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                      }`}
                  >
                    <span className="flex items-center gap-1 font-semibold">
                      {m.label}
                      {isPaid && <Check className="w-3 h-3 text-emerald-500" />}
                    </span>
                    {isPaid ? (
                      <span className="text-[8px] text-emerald-500 font-bold">PAID</span>
                    ) : isLate ? (
                      <span className="text-[8px] text-amber-300">(Overdue)</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('Card')}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${paymentMethod === 'Card'
                    ? 'bg-emerald-500/10 border-emerald-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
              >
                <CreditCard className={`w-5 h-5 ${paymentMethod === 'Card' ? 'text-emerald-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold">Debit / Credit Card</div>
                  <div className="text-[10px] text-emerald-400 font-medium">⚡ Instant Auto-Approval</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Bank Transfer')}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${paymentMethod === 'Bank Transfer'
                    ? 'bg-emerald-500/10 border-emerald-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
              >
                <Upload className={`w-5 h-5 ${paymentMethod === 'Bank Transfer' ? 'text-emerald-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold">Bank Slip Upload</div>
                  <div className="text-[10px] text-amber-400 font-medium">⏳ Manual Admin Review</div>
                </div>
              </button>
            </div>
          </div>

          {/* DYNAMIC FORM SECTION */}
          {paymentMethod === 'Card' ? (
            /* CARD PAYMENT INPUTS */
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-500" /> Secure Card Payment
                </span>
                <span className="text-[10px] text-slate-500">256-bit Encrypted</span>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="S S Wickramasinghe"
                  value={cardData.cardName}
                  onChange={(e) => setCardData({ ...cardData, cardName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Card Number</label>
                <input
                  type="text"
                  maxLength="19"
                  placeholder="4532 •••• •••• 8892"
                  value={cardData.cardNumber}
                  onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    placeholder="08/28"
                    maxLength="5"
                    value={cardData.expDate}
                    onChange={(e) => setCardData({ ...cardData, expDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">CVC / CWW</label>
                  <input
                    type="password"
                    maxLength="4"
                    placeholder="•••"
                    value={cardData.cvc}
                    onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* SLIP ATTACHMENT SECTION */
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Upload Bank Slip *
              </label>
              <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-xl p-3 text-center bg-slate-950/40 transition-colors relative">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {receiptFile ? (
                  <div className="flex flex-col items-center gap-0.5 text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                    <span className="text-xs font-medium text-slate-200">{receiptFile.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-400">
                    <Upload className="w-6 h-6 text-slate-500" />
                    <span className="text-xs font-medium text-slate-300">Click to upload deposit slip</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>Selected Months:</span>
              <span className="text-white font-semibold">{selectedMonths.length} Month(s)</span>
            </div>
            {lateMonthsCount > 0 && (
              <div className="flex justify-between text-amber-400 font-medium">
                <span>Late Fine:</span>
                <span className="font-mono">+ LKR {fineTotal.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-sm font-bold">
              <span className="text-white">Total Amount:</span>
              <span className="font-mono text-emerald-400 text-base">
                LKR {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedMonths.length === 0}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  {paymentMethod === 'Card' ? 'Pay Now & Instant Approve' : 'Submit Bank Slip'}
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default MemberPaymentModal;