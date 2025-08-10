import React from 'react'
import TenantDashboard from './components/TenantDashboard'
import AdminDashboard from './components/AdminDashboard'
import RoomManagement from './components/RoomManagement'
import TenantManagement from './components/TenantManagement'
import './index.css'

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="p-4">
        <div className="space-y-8">
          <TenantDashboard />
          <AdminDashboard />
          <RoomManagement />
          <TenantManagement />
        </div>
      </div>
    </div>
  )
}

export default App