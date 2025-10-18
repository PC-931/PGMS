import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContexts'
import ProtectedRoute from './components/auth/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import LoginPage from './pages/auth/LoginPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import TenantDashboardPage from './pages/tenant/TenantDashboard'
import './index.css'
import RoomManagement from './components/RoomManagement'
import TenantManagement from './components/TenantManagement'

// Public routes that don't need authentication
const PublicRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<div>Register Page (Coming Soon)</div>} />
      <Route path="/forgot-password" element={<div>Forgot Password (Coming Soon)</div>} />
      <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

const AdminRoutes: React.FC = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/rooms" element={<RoomManagement />} />
        <Route path="/admin/tenants" element={<TenantManagement />} />
        <Route path="/admin/rent" element={<div>Rent Management (Coming Soon)</div>} />
        <Route path="/admin/payments" element={<div>Payment Management (Coming Soon)</div>} />
        <Route path="/admin/maintenance" element={<div>Maintenance Management (Coming Soon)</div>} />
        <Route path="/admin/reports" element={<div>Reports (Coming Soon)</div>} />
        <Route path="/admin/settings" element={<div>Settings (Coming Soon)</div>} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </DashboardLayout>
  )
}

// Tenant routes
// const TenantRoutes: React.FC = () => {
//   return (
//     <DashboardLayout>
//       <Routes>
//         <Route path="/dashboard" element={<TenantDashboardPage />} />
//         <Route path="/dashboard/room" element={<div>My Room (Coming Soon)</div>} />
//         <Route path="/dashboard/rent" element={<div>Rent History (Coming Soon)</div>} />
//         <Route path="/dashboard/profile" element={<div>Profile (Coming Soon)</div>} />
//         <Route path="*" element={<Navigate to="/dashboard" replace />} />
//       </Routes>
//     </DashboardLayout>
//   )
// }
const TenantRoutes: React.FC = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/dashboard" element={<TenantDashboardPage />} />
        <Route path="/dashboard/room" element={<div>My Room (Coming Soon)</div>} />
        <Route path="/dashboard/payments" element={<div>Payment History (Coming Soon)</div>} />
        <Route path="/dashboard/maintenance" element={<div>Maintenance Requests (Coming Soon)</div>} />
        <Route path="/dashboard/profile" element={<div>Profile (Coming Soon)</div>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  )
}

// Main app component
const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <PublicRoutes />
  }

  return (
    <ProtectedRoute>
      {user?.role === 'ADMIN' ? <AdminRoutes /> : <TenantRoutes />}
    </ProtectedRoute>
  )
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App