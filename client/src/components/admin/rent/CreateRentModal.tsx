// File: client/src/components/admin/rent/CreateRentModal.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { X, AlertCircle } from 'lucide-react';
import { rentService } from '../../../services/rentService';
import { tenantService } from '../../../services/tenantService';
import { roomService } from '../../../services/roomService';
import { CreateRentData } from '../../../types/rent';

interface CreateRentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateRentModal: React.FC<CreateRentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [tenants, setTenants] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    tenantId: '',
    roomId: '',
    amount: '',
    periodStart: '',
    periodEnd: '',
    dueDate: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchTenantsAndRooms();
      resetForm();
    }
  }, [isOpen]);

  const fetchTenantsAndRooms = async () => {
    try {
      const [tenantsData, roomsData] = await Promise.all([
        tenantService.getAllTenants(),
        roomService.getAllRooms()
      ]);
      setTenants(tenantsData);
      setRooms(roomsData);
    } catch (err) {
      setError('Failed to load tenants and rooms');
    }
  };

  const resetForm = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const dueDate = new Date(today.getFullYear(), today.getMonth(), 5);

    setFormData({
      tenantId: '',
      roomId: '',
      amount: '',
      periodStart: firstDay.toISOString().split('T')[0],
      periodEnd: lastDay.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      notes: ''
    });
    setError('');
  };

  const handleTenantChange = (tenantId: string) => {
    setFormData(prev => ({ ...prev, tenantId }));
    
    // Find tenant's assigned room
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant && tenant.rooms.length > 0) {
      const room = tenant.rooms[0];
      setFormData(prev => ({
        ...prev,
        roomId: room.id,
        amount: room.rent?.toString() || ''
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.tenantId) {
      setError('Please select a tenant');
      return false;
    }
    if (!formData.roomId) {
      setError('Please select a room');
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    if (!formData.periodStart || !formData.periodEnd) {
      setError('Please select rent period');
      return false;
    }
    if (new Date(formData.periodStart) >= new Date(formData.periodEnd)) {
      setError('Period end date must be after start date');
      return false;
    }
    if (!formData.dueDate) {
      setError('Please select due date');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const rentData: CreateRentData = {
        tenantId: formData.tenantId,
        roomId: formData.roomId,
        amount: parseFloat(formData.amount),
        periodStart: new Date(formData.periodStart).toISOString(),
        periodEnd: new Date(formData.periodEnd).toISOString(),
        dueDate: new Date(formData.dueDate).toISOString(),
        notes: formData.notes || undefined
      };

      await rentService.createRent(rentData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create rent');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Create New Rent</CardTitle>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tenant *
                </label>
                <select
                  value={formData.tenantId}
                  onChange={(e) => handleTenantChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select tenant</option>
                  {tenants.map(tenant => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.firstName} {tenant.lastName} {tenant.rooms.length === 0 && '(Unassigned)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room *
                </label>
                <select
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  required
                  disabled={!formData.tenantId}
                >
                  <option value="">Select room</option>
                  {rooms
                    .filter(room => room.tenants?.some(t => t.id === formData.tenantId))
                    .map(room => (
                      <option key={room.id} value={room.id}>
                        Room {room.number} - {room.type}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rent Amount (₹) *
              </label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period Start *
                </label>
                <Input
                  type="date"
                  value={formData.periodStart}
                  onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period End *
                </label>
                <Input
                  type="date"
                  value={formData.periodEnd}
                  onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date *
              </label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
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
                rows={3}
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
                {loading ? 'Creating...' : 'Create Rent'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateRentModal;