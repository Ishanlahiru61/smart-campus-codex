import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import LoginPage from './pages/LoginPage';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminFacilities from './pages/admin/AdminFacilities';
import AdminBookings from './pages/admin/AdminBookings';
import AdminIncidents from './pages/admin/AdminIncidents';
import AdminTechnicians from './pages/admin/AdminTechnicians';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import UserFacilities from './pages/user/UserFacilities';
import UserBookings from './pages/user/UserBookings';
import UserIncidents from './pages/user/UserIncidents';

// Technician Pages
import TechnicianDashboard from './pages/tech/TechnicianDashboard';

export default function App() {
  return (
    <>
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard"    element={<AdminDashboard />} />
          <Route path="users"        element={<AdminUsers />} />
          <Route path="facilities"   element={<AdminFacilities />} />
          <Route path="bookings"     element={<AdminBookings />} />
          <Route path="incidents"    element={<AdminIncidents />} />
          <Route path="technicians"  element={<AdminTechnicians />} />
          <Route path=""             element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* User Routes */}
        <Route path="/user" element={
          <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard"  element={<UserDashboard />} />
          <Route path="facilities" element={<UserFacilities />} />
          <Route path="bookings"   element={<UserBookings />} />
          <Route path="incidents"  element={<UserIncidents />} />
          <Route path=""           element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Technician Routes */}
        <Route path="/tech" element={
          <ProtectedRoute allowedRoles={['TECHNICIAN', 'ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<TechnicianDashboard />} />
          <Route path=""          element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
