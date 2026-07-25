import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api'
});

// Auto-attach JWT Token to every request header
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;

// Fetch payments for the logged-in member
export const getMyPayments = async () => {
  const response = await API.get('/payments/my-payments');
  return response.data;
};

// Submit a payment receipt by the member
export const submitMemberPayment = async (formData) => {
  const response = await API.post('/payments/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Get Member's Payment History & Summary (Due Months, Total Paid)
export const getMemberDashboardSummary = () => {
    return API.get('/payments/my-summary');
};