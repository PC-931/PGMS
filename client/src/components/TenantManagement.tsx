import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import Navbar from './Navbar'
import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Plus, Search, Edit2, Trash2, X, AlertCircle } from 'lucide-react'
import { tenantService } from '../services/tenantService'
import { Tenant, UnassignedTenant, TenantFormData } from '../types'

interface TenantFormState extends TenantFormData {
  confirmPassword: string
}

const TenantManagement: React.FC = () => {
  // State management
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ASSIGNED' | 'UNASSIGNED'>('ALL')
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'rooms' | 'created'>('name')
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  
  // Form state
  const [formData, setFormData] = useState<TenantFormState>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    confirmPassword: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const adminLinks = [
    { label: 'Home', href: '#' },
    { label: 'Manage', href: '#' },
    { label: 'Logout', href: '#' }
  ]

  // Fetch tenants on mount
  useEffect(() => {
    fetchTenants()
  }, [])

  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await tenantService.getAllTenants()
      setTenants(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch tenants'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Filter and sort tenants
  const processedTenants = useCallback(() => {
    let filtered = tenantService.filterTenantsByStatus(tenants, filterStatus.toLowerCase() as 'all' | 'assigned' | 'unassigned')
    filtered = tenantService.searchTenants(filtered, searchTerm)
    filtered = tenantService.sortTenants(filtered, sortBy)
    return filtered
  }, [tenants, searchTerm, filterStatus, sortBy])

  // Form validation
  const validateForm = (data: TenantFormState, isEdit = false): boolean => {
    const errors: Record<string, string> = {}

    if (!data.firstName?.trim()) {
      errors.firstName = 'First name is required'
    }

    if (!data.lastName?.trim()) {
      errors.lastName = 'Last name is required'
    }

    if (!data.email?.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Invalid email format'
    }

    if (!isEdit) {
      if (!data.password?.trim()) {
        errors.password = 'Password is required'
      } else if (data.password.length < 6) {
        errors.password = 'Password must be at least 6 characters'
      }

      if (data.password !== data.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match'
      }
    }

    if (data.phone && !/^[\d\s\-\+\(\)]+$/.test(data.phone)) {
      errors.phone = 'Invalid phone number format'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle add tenant
  const handleAddTenant = async () => {
    if (!validateForm(formData)) return

    try {
      setIsSubmitting(true)
      await tenantService.createTenant({
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone?.trim() || undefined
      })
      
      setSuccessMessage('Tenant added successfully')
      setShowAddModal(false)
      resetForm()
      await fetchTenants()
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add tenant'
      setFormErrors({ submit: message })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle edit tenant
  const handleEditTenant = async () => {
    if (!selectedTenant || !validateForm(formData, true)) return

    try {
      setIsSubmitting(true)
      await tenantService.updateTenant(selectedTenant.id, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || undefined
      })
      
      setSuccessMessage('Tenant updated successfully')
      setShowEditModal(false)
      resetForm()
      await fetchTenants()
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update tenant'
      setFormErrors({ submit: message })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete tenant
  const handleDeleteTenant = async () => {
    if (!selectedTenant) return

    try {
      setIsSubmitting(true)
      await tenantService.deleteTenant(selectedTenant.id)
      
      setSuccessMessage('Tenant deleted successfully')
      setShowDeleteModal(false)
      setSelectedTenant(null)
      await fetchTenants()
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete tenant'
      setError(message)
      setShowDeleteModal(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      confirmPassword: ''
    })
    setFormErrors({})
  }

  // Open add modal
  const openAddModal = () => {
    resetForm()
    setShowAddModal(true)
  }

  // Open edit modal
  const openEditModal = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setFormData({
      email: tenant.email,
      password: '',
      firstName: tenant.firstName,
      lastName: tenant.lastName,
      phone: tenant.phone || '',
      confirmPassword: ''
    })
    setFormErrors({})
    setShowEditModal(true)
  }

  // Open delete modal
  const openDeleteModal = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setShowDeleteModal(true)
  }

  // Close modals
  const closeModals = () => {
    setShowAddModal(false)
    setShowEditModal(false)
    setShowDeleteModal(false)
    setSelectedTenant(null)
    resetForm()
  }

  // Get assignment status
  const getAssignmentStatus = (tenant: Tenant) => {
    if (tenant.rooms.length === 0) return 'Unassigned'
    if (tenant.rooms.length === 1) return `Room ${tenant.rooms[0].number}`
    return `${tenant.rooms.length} Rooms`
  }

  // Get status badge variant
  const getStatusVariant = (tenant: Tenant) => {
    return tenant.rooms.length > 0 ? 'success' : 'warning'
  }

  const displayedTenants = processedTenants()

  return (
    <Card className="bg-white rounded-2xl shadow-md">
      {/* <Navbar title="Tenant Management" showBreadcrumb links={adminLinks} /> */}

      {/* Alerts */}
      {error && (
        <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-sm text-red-700 hover:text-red-800 mt-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
          <p className="text-sm font-medium text-green-900">{successMessage}</p>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-green-700 hover:text-green-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Input
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search by name, email, or phone..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
          <Button
            onClick={openAddModal}
            className="bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Tenant
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'ALL' | 'ASSIGNED' | 'UNASSIGNED')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="ALL">All Tenants</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="UNASSIGNED">Unassigned</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'email' | 'rooms' | 'created')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="rooms">Rooms</option>
              <option value="created">Date Created</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto p-6">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : displayedTenants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">No tenants found</p>
          </div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rooms
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayedTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {tenantService.getDisplayName(tenant)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {tenant.email}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {tenant.phone || '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge variant={getStatusVariant(tenant)}>
                      {tenant.rooms.length > 0 ? 'Assigned' : 'Unassigned'}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {getAssignmentStatus(tenant)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => openEditModal(tenant)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors inline-flex items-center"
                      title="Edit tenant"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(tenant)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors inline-flex items-center"
                      title="Delete tenant"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Tenant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Add New Tenant</CardTitle>
              <button
                onClick={closeModals}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {formErrors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {formErrors.submit}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <Input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="John"
                />
                {formErrors.firstName && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <Input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Doe"
                />
                {formErrors.lastName && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="john@example.com"
                />
                {formErrors.email && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="+91 98765 43210"
                />
                {formErrors.phone && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••"
                />
                {formErrors.password && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••"
                />
                {formErrors.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.confirmPassword}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={closeModals}
                  className="flex-1 bg-gray-300 text-gray-800 hover:bg-gray-400"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddTenant}
                  className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Tenant'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Tenant Modal */}
      {showEditModal && selectedTenant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Edit Tenant</CardTitle>
              <button
                onClick={closeModals}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {formErrors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {formErrors.submit}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <Input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {formErrors.firstName && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <Input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {formErrors.lastName && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {formErrors.email && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {formErrors.phone && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.phone}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={closeModals}
                  className="flex-1 bg-gray-300 text-gray-800 hover:bg-gray-400"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditTenant}
                  className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Update Tenant'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedTenant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm bg-white">
            <CardHeader>
              <CardTitle className="text-red-600">Delete Tenant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete{' '}
                <strong>{tenantService.getDisplayName(selectedTenant)}</strong>? This action
                cannot be undone.
              </p>
              
              {selectedTenant.rooms.length > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                  This tenant is assigned to {selectedTenant.rooms.length} room(s). They must be unassigned first.
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={closeModals}
                  className="flex-1 bg-gray-300 text-gray-800 hover:bg-gray-400"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteTenant}
                  className="flex-1 bg-red-600 text-white hover:bg-red-700"
                  disabled={isSubmitting || selectedTenant.rooms.length > 0}
                >
                  {isSubmitting ? 'Deleting...' : 'Delete Tenant'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  )
}

export default TenantManagement