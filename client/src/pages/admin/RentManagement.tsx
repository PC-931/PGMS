// File: client/src/pages/admin/RentManagement.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Plus, Search, Eye, Trash2, DollarSign, Calendar,
  User, Building, AlertCircle, CheckCircle, X, Download
} from 'lucide-react';
import { rentService } from '../../services/rentService';
import { tenantService } from '../../services/tenantService';
import { roomService } from '../../services/roomService';
import { Rent, RentFilters, CreatePaymentData } from '../../types/rent';

// Payment Modal Component
const PaymentModal = ({ isOpen, onClose, rent, onSuccess }: {
  isOpen: boolean;
  onClose: () => void;
  rent: Rent | null;
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    paidAt: new Date().toISOString().split('T')[0],
    method: 'UPI',
    reference: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && rent) {
      setFormData({
        amount: rent.outstandingAmount.toString(),
        paidAt: new Date().toISOString().split('T')[0],
        method: 'UPI',
        reference: '',
        notes: ''
      });
      setError('');
    }
  }, [isOpen, rent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rent) return;

    const amount = parseFloat(formData.amount);
    if (amount <= 0 || amount > rent.outstandingAmount) {
      setError(`Amount must be between ₹1 and ₹${rent.outstandingAmount}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const paymentData: CreatePaymentData = {
        amount,
        paidAt: new Date(formData.paidAt).toISOString(),
        method: formData.method as any,
        reference: formData.reference || undefined,
        notes: formData.notes || undefined
      };

      await rentService.addPayment(rent.id, paymentData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !rent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Record Payment</CardTitle>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="bg-blue-50 p-3 rounded-lg text-sm">
              <p className="font-medium text-blue-900">Rent Details</p>
              <p className="text-blue-700">Room: {rent.room.number}</p>
              <p className="text-blue-700">Tenant: {rent.tenant.firstName} {rent.tenant.lastName}</p>
              <p className="text-blue-700">Outstanding: ₹{rent.outstandingAmount.toLocaleString()}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (₹) *
              </label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                min="0"
                max={rent.outstandingAmount}
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Date *
              </label>
              <Input
                type="date"
                value={formData.paidAt}
                onChange={(e) => setFormData({ ...formData, paidAt: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method *
              </label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Number
              </label>
              <Input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="Transaction ID, Cheque No, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                rows={2}
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                disabled={loading}
              >
                {loading ? 'Recording...' : 'Record Payment'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Rent Management Component
const RentManagement: React.FC = () => {
  const [rents, setRents] = useState<Rent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<RentFilters>({
    search: '',
    status: 'ALL',
    page: 1,
    limit: 10,
    sortBy: 'dueDate',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedRent, setSelectedRent] = useState<Rent | null>(null);

  // Fetch rents
  useEffect(() => {
    fetchRents();
  }, [filters]);

  const fetchRents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await rentService.getAllRents(filters);
      setRents(response.rents);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rents');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status: status as any, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleOpenPaymentModal = (rent: Rent) => {
    setSelectedRent(rent);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setSuccessMessage('Payment recorded successfully');
    setTimeout(() => setSuccessMessage(null), 3000);
    fetchRents();
  };

  const handleDeleteRent = async (rent: Rent) => {
    if (!window.confirm(`Are you sure you want to delete rent for ${rent.tenant.firstName} ${rent.tenant.lastName}?`)) {
      return;
    }

    try {
      await rentService.deleteRent(rent.id);
      setSuccessMessage('Rent deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchRents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete rent');
    }
  };

  const handleDownloadInvoice = async (rent: Rent) => {
    try {
      const invoice = await rentService.generateInvoice(rent.id);
      // In a real app, you'd format this as PDF
      console.log('Invoice:', invoice);
      alert('Invoice generated! Check console for details.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate invoice');
    }
  };

  if (loading && rents.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Rent Management</h1>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="ml-3 text-gray-600">Loading rents...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Rent Management</h1>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" />
          Create Rent
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
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
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium text-green-900">{successMessage}</p>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-green-700 hover:text-green-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by tenant, room, or email..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PARTIAL">Partial</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            >
              <option value="dueDate">Due Date</option>
              <option value="amount">Amount</option>
              <option value="status">Status</option>
              <option value="createdAt">Created Date</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Rents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rents ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Outstanding
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rents.map((rent) => (
                  <tr key={rent.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {rent.tenant.firstName} {rent.tenant.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{rent.tenant.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Room {rent.room.number}</div>
                          <div className="text-sm text-gray-500">{rent.room.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rentService.formatDate(rent.periodStart)} - {rentService.formatDate(rent.periodEnd)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{rent.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Paid: ₹{rent.paidAmount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        rent.outstandingAmount > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        ₹{rent.outstandingAmount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {rentService.formatDate(rent.dueDate)}
                      </div>
                      {rentService.isOverdue(rent.dueDate, rent.status) && (
                        <div className="text-xs text-red-600 mt-1">
                          {rentService.getDaysOverdue(rent.dueDate)} days overdue
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={rentService.getStatusBadgeVariant(rent.status)}>
                        {rent.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownloadInvoice(rent)}
                          className="p-1"
                          title="Download Invoice"
                        >
                          <Download className="h-4 w-4" />
                        </Button>

                        {rent.outstandingAmount > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenPaymentModal(rent)}
                            className="p-1 text-green-600 hover:text-green-700"
                            title="Record Payment"
                          >
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteRent(rent)}
                          className="p-1 text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {rents.length === 0 && (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No rents found</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <Button
                      key={i}
                      variant={pagination.page === i + 1 ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(i + 1)}
                      className="w-10"
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        rent={selectedRent}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default RentManagement;