import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { DashboardStats } from '../../types'
import { Building, Users, DollarSign, AlertCircle } from 'lucide-react'
import { roomService } from '../../services/roomService';
import { adminService } from '../../services/adminService';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data fetch
    const fetchStats = async () => {
      setLoading(true)
      const data = await adminService.getDashboardStats();
      setStats(data);

      setLoading(false)
    }

    fetchStats()
  }, [])

  const recentActivities = [
    { id: 1, type: 'payment', message: 'John Doe paid rent for July 2025', time: '2 hours ago' },
    { id: 2, type: 'maintenance', message: 'Room 101 marked for maintenance', time: '4 hours ago' },
    { id: 3, type: 'tenant', message: 'New tenant Alice registered', time: '1 day ago' },
    { id: 4, type: 'payment', message: 'Jane Smith payment overdue', time: '2 days ago' },
  ]

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRooms}</p>
              </div>
              <Building className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600">
                {stats.availableRooms} available
              </span>
              <span className="text-gray-500 ml-2">
                • {stats.occupiedRooms} occupied
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tenants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTenants}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
            {/* <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600">
                {stats.activeTenants} active
              </span>
            </div> */}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-red-600">
                ₹{stats.pendingPayments.toLocaleString()} pending
              </span>
            </div>
          </CardContent>
        </Card>

        {/* <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Maintenance</p>
                <p className="text-2xl font-bold text-gray-900">{stats.maintenanceRooms}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-orange-600">
                Rooms need attention
              </span>
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`h-2 w-2 rounded-full ${
                      activity.type === 'payment' ? 'bg-green-500' :
                      activity.type === 'maintenance' ? 'bg-orange-500' :
                      'bg-blue-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Add New Room</div>
                <div className="text-sm text-gray-500">Create a new room listing</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Register Tenant</div>
                <div className="text-sm text-gray-500">Add a new tenant to the system</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Generate Report</div>
                <div className="text-sm text-gray-500">Create monthly revenue report</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard