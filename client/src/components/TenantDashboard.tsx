import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Navbar from './Navbar'

interface RentRecord {
  month: string
  amount: number
  status: 'Paid' | 'Pending'
}

interface RoomPreferences {
  singleSharing: boolean
  doubleSharing: boolean
  tripleSharing: boolean
  fourSharing: boolean
}

const TenantDashboard: React.FC = () => {
  const [roomPreferences, setRoomPreferences] = useState<RoomPreferences>({
    singleSharing: false,
    doubleSharing: false,
    tripleSharing: false,
    fourSharing: false,
  })

  const rentData: RentRecord[] = [
    { month: 'July 2025', amount: 6000, status: 'Paid' }
  ]

  const handlePreferenceChange = (preference: keyof RoomPreferences) => {
    setRoomPreferences(prev => ({
      ...prev,
      [preference]: !prev[preference]
    }))
  }

  return (
    <Card className="bg-white p-6 rounded-2xl shadow-md">
      <Navbar title="Tenant Dashboard" />
      
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Rooms</h2>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(roomPreferences).map(([key, value]) => (
            <div key={key} className="flex items-center">
              <input
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                id={key}
                type="checkbox"
                checked={value}
                onChange={() => handlePreferenceChange(key as keyof RoomPreferences)}
              />
              <label className="ml-2 block text-sm text-gray-900" htmlFor={key}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </label>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Rent Status</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rentData.map((record, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={record.status === 'Paid' ? 'success' : 'warning'}>
                      {record.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Card>
  )
}

export default TenantDashboard