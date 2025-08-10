import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search } from 'lucide-react'
import Navbar from './Navbar'

interface Tenant {
  name: string
  room: string
  contact: string
  status: 'Active' | 'Inactive'
}

const TenantManagement: React.FC = () => {
  const adminLinks = [
    { label: 'Home', href: '#' },
    { label: 'Manage', href: '#' },
    { label: 'Logout', href: '#' }
  ]

  const tenants: Tenant[] = [
    { name: 'John Doe', room: 'Double', contact: '8878843210', status: 'Active' },
    { name: 'Jane Smith', room: 'Single', contact: '8785432109', status: 'Active' },
    { name: 'Alice Johnson', room: 'Triple', contact: '7684321038', status: 'Inactive' }
  ]

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success'
      case 'Inactive':
        return 'info'
      default:
        return 'info'
    }
  }

  return (
    <Card className="bg-white p-6 rounded-2xl shadow-md">
      <Navbar title="Tenant Management" showBreadcrumb links={adminLinks} />
      
      <div className="flex justify-between items-center mb-6">
        <div className="relative">
          <Input 
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            placeholder="Search" 
            type="text"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
        <Button className="bg-indigo-600 text-white hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Tenant
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Room
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tenants.map((tenant, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {tenant.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {tenant.room}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {tenant.contact}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={getStatusVariant(tenant.status)}>
                    {tenant.status}
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

export default TenantManagement