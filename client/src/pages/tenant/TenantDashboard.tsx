import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { useAuth } from '../../contexts/AuthContexts'
import { RentRecord } from '../../types'
import { Building, CreditCard, User, Calendar } from 'lucide-react'

interface TenantInfo {
  roomNumber: string
  roomType: string
  monthlyRent: number
  joinedDate: string
  rentDueDate: string
}

const TenantDashboardPage: React.FC = () => {
  const { user } = useAuth()
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null)
  const [rentHistory, setRentHistory] = useState<RentRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data fetch
    const fetchTenantData = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockTenantInfo: TenantInfo = {
        roomNumber: '102',
        roomType: 'Double Sharing',
        monthlyRent: 6000,
        joinedDate: '2024-01-15',
        rentDueDate: '5th of each month'
      }
      
      const mockRentHistory: RentRecord[] = [
        {
          id: '1',
          tenantId: user?.id || '',
          roomId: '102',
          month: 'July 2025',
          amount: 6000,
          status: 'Paid',
          paidAt: '2025-07-03T10:30:00Z',
          createdAt: '2025-07-01T00:00:00Z',
          updatedAt: '2025-07-03T10:30:00Z'
        },
        {
          id: '2',
          tenantId: user?.id || '',
          roomId: '102',
          month: 'June 2025',
          amount: 6000,
          status: 'Paid',
          paidAt: '2025-06-02T14:20:00Z',
          createdAt: '2025-06-01T00:00:00Z',
          updatedAt: '2025-06-02T14:20:00Z'
        },
        {
          id: '3',
          tenantId: user?.id || '',
          roomId: '102',
          month: 'August 2025',
          amount: 6000,
          status: 'Pending',
          createdAt: '2025-08-01T00:00:00Z',
          updatedAt: '2025-08-01T00:00:00Z'
        }
      ]
      
      setTenantInfo(mockTenantInfo)
      setRentHistory(mockRentHistory)
      setLoading(false)
    }

    fetchTenantData()
  }, [user])

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'success'
      case 'Pending':
        return 'warning'
      case 'Overdue':
        return 'danger'
      default:
        return 'info'
    }
  }

  const pendingPayments = rentHistory.filter(record => record.status === 'Pending')
  const totalPending = pendingPayments.reduce((sum, record) => sum + record.amount, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600">Here's your rental dashboard overview</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">My Room</p>
                <p className="text-2xl font-bold text-gray-900">{tenantInfo?.roomNumber}</p>
              </div>
              <Building className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-500">{tenantInfo?.roomType}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Rent</p>
                <p className="text-2xl font-bold text-gray-900">₹{tenantInfo?.monthlyRent.toLocaleString()}</p>
              </div>
              <CreditCard className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-500">Due: {tenantInfo?.rentDueDate}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalPending.toLocaleString()}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2">
              {totalPending > 0 ? (
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                  Pay Now
                </Button>
              ) : (
                <span className="text-sm text-green-600">All caught up!</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rent History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Rent History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rentHistory.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.month}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{record.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge variant={getStatusVariant(record.status)}>
                        {record.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.paidAt 
                        ? new Date(record.paidAt).toLocaleDateString()
                        : '-'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">Pay Rent</div>
              <div className="text-sm text-gray-500">Make your monthly payment</div>
            </button>
            <button className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">Request Maintenance</div>
              <div className="text-sm text-gray-500">Report room issues</div>
            </button>
            <button className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">Download Receipt</div>
              <div className="text-sm text-gray-500">Get payment receipts</div>
            </button>
            <button className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">Update Profile</div>
              <div className="text-sm text-gray-500">Change your information</div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TenantDashboardPage