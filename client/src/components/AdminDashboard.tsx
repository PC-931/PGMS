import React from 'react'
import { Card } from '../components/ui/card'
import Navbar from './Navbar'

const AdminDashboard: React.FC = () => {
  const adminLinks = [
    { label: 'Home', href: '#' },
    { label: 'Manage', href: '#' },
    { label: 'Logout', href: '#' }
  ]

  const overviewCards = [
    { title: 'Rooms', placeholder: true },
    { title: 'Tenants', placeholder: true },
    { title: 'Rent', placeholder: true }
  ]

  return (
    <Card className="bg-white p-6 rounded-2xl shadow-md">
      <Navbar title="Admin Dashboard" showBreadcrumb links={adminLinks} />
      
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Overview</h2>
        <div className="grid grid-cols-3 gap-4">
          {overviewCards.map((card, index) => (
            <div key={index} className="bg-gray-100 p-4 rounded-lg text-center">
              <div className="bg-gray-200 h-20 rounded-md mb-2"></div>
              <p className="text-sm font-medium text-gray-700">{card.title}</p>
            </div>
          ))}
        </div>
      </section>
    </Card>
  )
}

export default AdminDashboard