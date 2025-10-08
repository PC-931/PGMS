// Save this as: client/src/components/RoomManagement.tsx
// This component now includes full "Add Room" functionality

import React, { useState, useEffect } from 'react';
import { roomService } from '../services/roomService';
import { tenantService } from '../services/tenantService';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Plus, Search, Trash2, User, Users, Building, DollarSign,
  Eye, X, UserPlus, UserMinus, AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import { Room } from '../types';

const Modal = ({ isOpen, onClose, children, title, size = 'md' }: { 
  isOpen: boolean; 
  onClose: () => void;
  children: React.ReactNode; 
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) => {
  if (!isOpen) return null;
  const sizeClasses = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className={`relative bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full mx-4 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Add Room Modal - NEW FUNCTIONALITY
const AddRoomModal = ({ isOpen, onClose, onSuccess }: { 
  isOpen: boolean; 
  onClose: () => void;
  onSuccess: () => void; 
}) => {
  const [formData, setFormData] = useState({
    number: '', type: 'SINGLE', rent: '', deposit: '', floor: '', amenities: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const roomTypes = [
    { value: 'SINGLE', label: 'Single Sharing', capacity: 1 },
    { value: 'DOUBLE', label: 'Double Sharing', capacity: 2 },
    { value: 'TRIPLE', label: 'Triple Sharing', capacity: 3 },
    { value: 'FOUR', label: 'Four Sharing', capacity: 4 }
  ];

  const commonAmenities = [
    'Wi-Fi', 'AC', 'Attached Bathroom', 'Balcony', 
    'Wardrobe', 'Study Table', 'TV', 'Geyser'
  ];

  useEffect(() => {
    if (isOpen) {
      setFormData({ number: '', type: 'SINGLE', rent: '', deposit: '', floor: '', amenities: '' });
      setSelectedAmenities([]);
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.number.trim()) newErrors.number = 'Room number is required';
    if (!formData.rent || parseFloat(formData.rent) <= 0) newErrors.rent = 'Valid rent amount is required';
    if (!formData.deposit || parseFloat(formData.deposit) < 0) newErrors.deposit = 'Valid deposit amount is required';
    if (!formData.floor || parseInt(formData.floor) < 0) newErrors.floor = 'Valid floor number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const roomData = {
        number: formData.number.trim(),
        type: formData.type,
        rent: parseFloat(formData.rent),
        deposit: parseFloat(formData.deposit),
        floor: parseInt(formData.floor),
        amenities: selectedAmenities.length > 0 
          ? selectedAmenities 
          : (formData.amenities.trim() 
              ? formData.amenities.split(',').map(a => a.trim()).filter(a => a) 
              : [])
      };

      await roomService.createRoom(roomData);
      alert('Room added successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating room:', error);
      alert(error.response?.data?.error 
        ? `Error: ${error.response.data.error}` 
        : 'Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Room" size="lg">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Number <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="number"
              value={formData.number}
              onChange={handleInputChange}
              placeholder="e.g., 101, A-201"
              className={errors.number ? 'border-red-500' : ''}
            />
            {errors.number && <p className="text-red-500 text-xs mt-1">{errors.number}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Type <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            >
              {roomTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label} (Max: {type.capacity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Rent (₹) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              name="rent"
              value={formData.rent}
              onChange={handleInputChange}
              placeholder="e.g., 8000"
              min="0"
              step="100"
              className={errors.rent ? 'border-red-500' : ''}
            />
            {errors.rent && <p className="text-red-500 text-xs mt-1">{errors.rent}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deposit (₹) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              name="deposit"
              value={formData.deposit}
              onChange={handleInputChange}
              placeholder="e.g., 5000"
              min="0"
              step="100"
              className={errors.deposit ? 'border-red-500' : ''}
            />
            {errors.deposit && <p className="text-red-500 text-xs mt-1">{errors.deposit}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Floor Number <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              name="floor"
              value={formData.floor}
              onChange={handleInputChange}
              placeholder="e.g., 1"
              min="0"
              className={errors.floor ? 'border-red-500' : ''}
            />
            {errors.floor && <p className="text-red-500 text-xs mt-1">{errors.floor}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Amenities</label>
          <div className="grid grid-cols-2 gap-3">
            {commonAmenities.map(amenity => (
              <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Amenities (comma-separated)
          </label>
          <Input
            type="text"
            name="amenities"
            value={formData.amenities}
            onChange={handleInputChange}
            placeholder="e.g., Mini Fridge, Microwave"
          />
          <p className="text-xs text-gray-500 mt-1">
            Add custom amenities separated by commas
          </p>
        </div>

        <div className="bg-indigo-50 p-4 rounded-lg">
          <h4 className="font-medium text-indigo-900 mb-2">Summary</h4>
          <div className="text-sm text-indigo-700 space-y-1">
            <p><strong>Room:</strong> {formData.number || 'N/A'}</p>
            <p><strong>Type:</strong> {roomTypes.find(t => t.value === formData.type)?.label}</p>
            <p><strong>Rent:</strong> ₹{formData.rent || '0'}/month</p>
            <p><strong>Deposit:</strong> ₹{formData.deposit || '0'}</p>
            <p><strong>Floor:</strong> {formData.floor || 'N/A'}</p>
            {selectedAmenities.length > 0 && (
              <p><strong>Amenities:</strong> {selectedAmenities.join(', ')}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" onClick={onClose} variant="outline" disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
            {loading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Room
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Delete Room Confirmation Modal - NEW
const DeleteRoomModal = ({ isOpen, onClose, room, onSuccess }: { 
  isOpen: boolean; 
  onClose: () => void;
  room: Room | null;
  onSuccess: () => void; 
}) => {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setConfirmText('');
    }
  }, [isOpen]);

  const handleDelete = async () => {
    if (!room) return;

    setLoading(true);
    try {
      await roomService.deleteRoom(room.id);
      alert('Room deleted successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error deleting room:', error);
      alert(error.response?.data?.error 
        ? `Error: ${error.response.data.error}` 
        : 'Failed to delete room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!room) return null;

  const canDelete = room.currentOccupancy === 0;
  const isConfirmed = confirmText.toUpperCase() === 'DELETE';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Room" size="md">
      <div className="p-6 space-y-4">
        <div className={`p-4 rounded-lg ${canDelete ? 'bg-yellow-50' : 'bg-red-50'}`}>
          <div className="flex items-start">
            <AlertCircle className={`h-5 w-5 ${canDelete ? 'text-yellow-600' : 'text-red-600'} mt-0.5 mr-3`} />
            <div>
              <h4 className={`font-medium ${canDelete ? 'text-yellow-900' : 'text-red-900'}`}>
                {canDelete ? 'Warning' : 'Cannot Delete Room'}
              </h4>
              <p className={`text-sm mt-1 ${canDelete ? 'text-yellow-700' : 'text-red-700'}`}>
                {canDelete 
                  ? 'This action cannot be undone. This will permanently delete the room and all associated data.'
                  : `This room cannot be deleted because it currently has ${room.currentOccupancy} tenant(s) assigned. Please release all tenants before deleting the room.`
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Room Details</h4>
          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>Room Number:</strong> {room.number}</p>
            <p><strong>Type:</strong> {room.type}</p>
            <p><strong>Floor:</strong> {room.floor}</p>
            <p><strong>Current Occupancy:</strong> {room.currentOccupancy}/{room.maxOccupancy}</p>
            <p><strong>Status:</strong> {room.status}</p>
          </div>
        </div>

        {canDelete && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="font-bold">DELETE</span> to confirm
            </label>
            <Input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="uppercase"
            />
            <p className="text-xs text-gray-500 mt-1">
              This confirmation is required to prevent accidental deletions
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button onClick={onClose} variant="outline" disabled={loading}>
            Cancel
          </Button>
          {canDelete && (
            <Button 
              onClick={handleDelete}
              disabled={!isConfirmed || loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Room
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

// Room Details Modal (existing)
const RoomDetailsModal = ({ isOpen, onClose, room, onAssignTenant, onReleaseTenant }: { 
  isOpen: boolean; 
  onClose: () => void;
  room: Room | null;
}) => {
  if (!room) return null;

  const getRoomTypeInfo = (type) => {
    const typeMap = {
      SINGLE: { name: 'Single Sharing', icon: '👤' },
      DOUBLE: { name: 'Double Sharing', icon: '👥' },
      TRIPLE: { name: 'Triple Sharing', icon: '👨‍👩‍👧' },
      FOUR: { name: 'Four Sharing', icon: '👨‍👩‍👧‍👦' }
    };
    return typeMap[type] || { name: type, icon: '🏠' };
  };

  const typeInfo = getRoomTypeInfo(room.type);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Room ${room.number} Details`} size="lg">
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
              <p className="text-lg font-semibold text-gray-900">{room.number}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <div className="flex items-center space-x-2">
                <span className="text-xl">{typeInfo.icon}</span>
                <Badge variant="secondary" className="text-sm">{typeInfo.name}</Badge>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
              <p className="text-gray-900">Floor {room.floor}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Badge 
                variant={room.status === 'AVAILABLE' ? 'default' : 
                        room.status === 'OCCUPIED' ? 'secondary' : 'destructive'}
                className="text-sm"
              >
                {room.status}
              </Badge>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent</label>
              <p className="text-lg font-semibold text-green-600">₹{room.rent.toLocaleString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deposit</label>
              <p className="text-gray-900">₹{room.deposit.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3">Occupancy Information</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{room.currentOccupancy}</div>
              <div className="text-sm text-blue-700">Current</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{room.maxOccupancy}</div>
              <div className="text-sm text-blue-700">Maximum</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{room.availableSpots}</div>
              <div className="text-sm text-green-700">Available</div>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${room.isFullyOccupied ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${(room.currentOccupancy / room.maxOccupancy) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {room.tenants && room.tenants.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Current Tenants</label>
            <div className="space-y-3">
              {room.tenants.map((tenant) => (
                <div key={tenant.id} className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium">{tenant.firstName} {tenant.lastName}</p>
                    <p className="text-sm text-gray-600">{tenant.email}</p>
                    {tenant.phone && <p className="text-sm text-gray-600">{tenant.phone}</p>}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onReleaseTenant(room, tenant)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <UserMinus className="h-4 w-4 mr-1" />
                    Release
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {room.amenities && room.amenities.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {room.amenities.map((amenity, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t">
          <div>
            {!room.isFullyOccupied && (
              <Button 
                onClick={() => onAssignTenant(room)}
                className="bg-green-600 hover:bg-green-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Tenant
              </Button>
            )}
          </div>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Assign Tenant Modal (existing)
const AssignTenantModal = ({ isOpen, onClose, room, onSuccess }: { 
  isOpen: boolean; 
  onClose: () => void;
  room: Room | null;
  onSuccess: () => void; 
}) => {
  const [availableTenants, setAvailableTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableTenants();
    }
  }, [isOpen]);

  const fetchAvailableTenants = async () => {
    try {
      const tenants = await tenantService.getUnassignedTenants();
      setAvailableTenants(tenants);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  const handleAssign = async () => {
    if (!selectedTenant || !room) return;

    setLoading(true);
    try {
      await roomService.assignTenant(room.id, selectedTenant);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error assigning tenant:', error);
      alert('Error assigning tenant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!room) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Assign Tenant to Room ${room.number}`}>
      <div className="p-6 space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900">Room Information</h4>
          <p className="text-sm text-blue-700">
            Room {room.number} - {room.type} - Occupancy: {room.currentOccupancy}/{room.maxOccupancy}
          </p>
          <p className="text-sm text-blue-700">
            Available spots: {room.availableSpots}
          </p>
        </div>

        {availableTenants.length === 0 ? (
          <div className="text-center py-4">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No unassigned tenants available</p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Tenant</label>
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a tenant</option>
              {availableTenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.firstName} {tenant.lastName} - {tenant.email}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={!selectedTenant || loading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? 'Assigning...' : 'Assign Tenant'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Main Room Management Component
const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [occupancyStats, setOccupancyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [occupancyFilter, setOccupancyFilter] = useState('ALL');
  
  const [modals, setModals] = useState({
    details: false,
    assign: false,
    delete: false,
    addRoom: false  // NEW: Added addRoom modal state
  });
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [rooms, searchTerm, statusFilter, typeFilter, occupancyFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsData, statsData] = await Promise.all([
        roomService.getAllRooms(),
        roomService.getOccupancyStats()
      ]);
      setRooms(roomsData);
      setOccupancyStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRooms = () => {
    let filtered = rooms;

    if (searchTerm) {
      filtered = filtered.filter(room => 
        room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(room => room.status === statusFilter);
    }

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(room => room.type === typeFilter);
    }

    if (occupancyFilter !== 'ALL') {
      filtered = filtered.filter(room => {
        switch (occupancyFilter) {
          case 'EMPTY':
            return room.currentOccupancy === 0;
          case 'PARTIAL':
            return room.currentOccupancy > 0 && !room.isFullyOccupied;
          case 'FULL':
            return room.isFullyOccupied;
          default:
            return true;
        }
      });
    }

    setFilteredRooms(filtered);
  };

  const openModal = (modalName, room = null) => {
    setSelectedRoom(room);
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    setSelectedRoom(null);
  };

  const handleAssignTenant = (room) => {
    openModal('assign', room);
  };

  const handleReleaseTenant = async (room, tenant) => {
    if (window.confirm(`Are you sure you want to release ${tenant.firstName} ${tenant.lastName} from Room ${room.number}?`)) {
      try {
        await roomService.releaseTenant(room.id, tenant.id);
        fetchData();
        closeModal('details');
      } catch (error) {
        console.error('Error releasing tenant:', error);
        alert('Error releasing tenant. Please try again.');
      }
    }
  };

  const handleDeleteRoom = (room) => {
    openModal('delete', room);
  };

  const getOccupancyColor = (currentOccupancy, maxOccupancy) => {
    const percentage = (currentOccupancy / maxOccupancy) * 100;
    if (percentage === 0) return 'text-gray-500';
    if (percentage === 100) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    return 'text-green-600';
  };

  const getStatusBadgeVariant = (status, isFullyOccupied) => {
    switch (status) {
      case 'AVAILABLE':
        return isFullyOccupied ? 'secondary' : 'default';
      case 'OCCUPIED':
        return 'secondary';
      case 'MAINTENANCE':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Room Management</h1>
        </div>
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Room Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Room Management</h1>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => openModal('addRoom')}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Room
        </Button>
      </div>

      {/* Occupancy Statistics */}
      {occupancyStats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                  <p className="text-2xl font-bold text-gray-900">{occupancyStats.totalRooms}</p>
                </div>
                <Building className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                  <p className="text-2xl font-bold text-blue-600">{occupancyStats.totalCapacity}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Occupied</p>
                  <p className="text-2xl font-bold text-green-600">{occupancyStats.totalOccupied}</p>
                </div>
                <User className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Spots</p>
                  <p className="text-2xl font-bold text-orange-600">{occupancyStats.availableSpots}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{occupancyStats.occupancyRate}%</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Types</option>
              <option value="SINGLE">Single</option>
              <option value="DOUBLE">Double</option>
              <option value="TRIPLE">Triple</option>
              <option value="FOUR">Four</option>
            </select>

            <select
              value={occupancyFilter}
              onChange={(e) => setOccupancyFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Occupancy</option>
              <option value="EMPTY">Empty</option>
              <option value="PARTIAL">Partially Occupied</option>
              <option value="FULL">Fully Occupied</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rooms ({filteredRooms.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Occupancy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rent
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
                {filteredRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Room {room.number}</div>
                          <div className="text-sm text-gray-500">Floor {room.floor}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className="text-xs mb-1">
                        {room.type.replace('_', ' ')}
                      </Badge>
                      <div className="text-xs text-gray-500">
                        Max: {room.maxOccupancy}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${getOccupancyColor(room.currentOccupancy, room.maxOccupancy)}`}>
                          {room.currentOccupancy} / {room.maxOccupancy}
                        </span>
                        {room.isFullyOccupied && (
                          <Badge variant="destructive" className="text-xs">Full</Badge>
                        )}
                        {room.availableSpots > 0 && (
                          <Badge variant="default" className="text-xs">{room.availableSpots} available</Badge>
                        )}
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                        <div 
                          className={`h-1 rounded-full ${room.isFullyOccupied ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${(room.currentOccupancy / room.maxOccupancy) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        ₹{room.rent.toLocaleString()}
                      </span>
                      <div className="text-xs text-gray-500">per month</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusBadgeVariant(room.status, room.isFullyOccupied)}>
                        {room.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openModal('details', room)}
                          className="p-1"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {!room.isFullyOccupied && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAssignTenant(room)}
                            className="p-1 text-green-600 hover:text-green-700"
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteRoom(room)}
                          className="p-1 text-red-600 hover:text-red-700"
                          disabled={room.currentOccupancy > 0}
                          title={room.currentOccupancy > 0 ? 'Cannot delete room with tenants' : 'Delete room'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredRooms.length === 0 && (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No rooms found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <RoomDetailsModal
        isOpen={modals.details}
        onClose={() => closeModal('details')}
        room={selectedRoom}
        onAssignTenant={handleAssignTenant}
        onReleaseTenant={handleReleaseTenant}
      />

      <AssignTenantModal
        isOpen={modals.assign}
        onClose={() => closeModal('assign')}
        room={selectedRoom}
        onSuccess={fetchData}
      />

      <AddRoomModal
        isOpen={modals.addRoom}
        onClose={() => closeModal('addRoom')}
        onSuccess={fetchData}
      />

      <DeleteRoomModal
        isOpen={modals.delete}
        onClose={() => closeModal('delete')}
        room={selectedRoom}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default RoomManagement;