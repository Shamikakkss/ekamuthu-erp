import React, { useState } from 'react';
import { Upload, CheckCircle, XCircle } from 'lucide-react';
import { submitMemberPayment } from '../api';

const MemberPaymentModal = ({ isOpen, onClose, onSuccess }) => {
  const [monthYear, setMonthYear] = useState('');
  const [amount, setAmount] = useState(1000); // Standard monthly fee
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [remarks, setRemarks] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!monthYear || !receiptFile) {
      setError('Please select the payment month and attach the receipt slip.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('amount', amount);
      formData.append('paymentType', 'Monthly Subscription');
      formData.append('monthYear', monthYear);
      formData.append('paymentMethod', paymentMethod);
      formData.append('remarks', remarks);
      formData.append('receipt', receiptFile);

      await submitMemberPayment(formData);
      setLoading(false);
      onSuccess(); // Refresh parent payments list
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to submit payment.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4">💳 Monthly Payment (Online Slip Upload)</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Applicable Month (Month / Year)</label>
            <input
              type="month"
              value={monthYear}
              onChange={(e) => setMonthYear(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-800 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (LKR)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-800"
            >
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash Deposit">Cash Deposit (CDM)</option>
              <option value="Online Banking">Online App Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Slip (Image / PDF)</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setReceiptFile(e.target.files[0])}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Paid via Commercial Bank"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-800"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              {loading ? 'Uploading...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberPaymentModal;