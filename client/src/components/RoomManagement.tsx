import React from 'react'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Plus } from 'lucide-react'
import Navbar from './Navbar'

interface Room {
  type: string
  capacity: number
  occupancy: number
  status: 'Available' | 'Occupied'
}

const RoomManagement: React.FC = () => {
  const rooms: Room[] = [
    { type: 'Single', capacity: 1, occupancy: 1, status: 'Occupied' },
    { type: 'Double', capacity: 2, occupancy: 1, status: 'Available' },
    { type: 'Triple', capacity: 3, occupancy: 2, status: 'Available' },
    { type: 'Four', capacity: 4, occupancy: 3, status: 'Occupied' }
  ]

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Available':
        return 'success'
      case 'Occupied':
        return 'danger'
      default:
        return 'info'
    }
  }

  return (
    <Card className="bg-white p-6 rounded-2xl shadow-md">
      <Navbar title="Room Management" />
      
      <div className="mb-6">
        <Button className="bg-indigo-600 text-white hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Room
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Room Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Occupancy
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rooms.map((room, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {room.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {room.capacity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {room.occupancy}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={getStatusVariant(room.status)}>
                    {room.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default RoomManagement