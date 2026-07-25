import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Payments from './pages/Payments';
import Claims from './pages/Claims';
import UserPortal from './pages/UserPortal'; // 1. User Portal එක import කරගන්න

const ProtectedRoute = ({ allowedRoles, children }) => {
    const token = localStorage.getItem('token');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    if (!token) {
        return <Navigate to="/" replace />;
    }

    // Role එක අනුව Redirect කිරීම
    if (allowedRoles && !allowedRoles.includes(userInfo.role)) {
        return userInfo.role === 'Member' 
            ? <Navigate to="/portal" replace /> 
            : <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />

                {/* Normal Member Portal Route */}
                <Route
                    path="/portal"
                    element={
                        <ProtectedRoute allowedRoles={['Member']}>
                            <UserPortal />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Dashboard Routes */}
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin', 'Treasurer']}>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                >
                    <Route path="members" element={<Members />} />
                    <Route path="payments" element={<Payments />} />
                    <Route path="claims" element={<Claims />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;