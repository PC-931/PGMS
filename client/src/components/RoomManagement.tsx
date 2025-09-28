import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  User, 
  Users,
  Building,
  DollarSign,
  Eye,
  X,
  UserPlus
} from 'lucide-react'
import { Room, Tenant } from '../types'
import { roomService } from '../services/roomService'
import { tenantService } from '../services/tenantService'

// Modal Component
const Modal = ({ isOpen, onClose, children, title, size = 'md' }: { 
  isOpen: boolean; 
  onClose: () => void; 
  children: React.ReactNode; 
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

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

// Room Details Modal
const RoomDetailsModal = ({ isOpen, onClose, room }: {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
}) => {
  if (!room) return null;

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
              <Badge variant="secondary" className="text-sm">{room.type.replace('_', ' ')}</Badge>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <p className="text-gray-900">{room.capacity} person(s)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Occupancy</label>
              <p className="text-gray-900">{room.occupancy || 0} / {room.capacity}</p>
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
              <p className="text-lg font-semibold text-green-600">₹{room.rent?.toLocaleString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deposit</label>
              <p className="text-gray-900">₹{room.deposit?.toLocaleString() || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
              <p className="text-gray-900">{room.floor || 'N/A'}</p>
            </div>
          </div>
        </div>

        {room.amenities && room.amenities.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {room.amenities.map((amenity: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {room.tenantId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Tenant</label>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium">Tenant ID: {room.tenantId}</p>
              <p className="text-sm text-gray-600">Check tenant details in Tenant Management</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

// Assign Tenant Modal
const AssignTenantModal = ({ isOpen, onClose, room, onSuccess }: {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  onSuccess: () => void;
}) => {
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableTenants();
    }
  }, [isOpen]);

  const fetchAvailableTenants = async () => {
    try {
      const tenants = await tenantService.getAllTenants();
      // Filter tenants without room assignments
      const unassignedTenants = tenants.filter((tenant: Tenant) => !tenant.roomId);
      setAvailableTenants(unassignedTenants);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  const handleAssign = async () => {
    if (!selectedTenant || !room) return;

    setLoading(true);
    try {
      // Update room to assign tenant
      await roomService.updateRoom(room.id, {
        status: 'OCCUPIED',
        tenantId: selectedTenant,
        occupancy: (room.occupancy || 0) + 1
      });

      // Update tenant with room assignment
      await tenantService.updateTenant(selectedTenant, {
        roomId: room.id
      });

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
            Room {room.number} - {room.type} - Capacity: {room.capacity}
          </p>
          <p className="text-sm text-blue-700">
            Current Occupancy: {room.occupancy || 0} / {room.capacity}
          </p>
        </div>

        {availableTenants.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500">No unassigned tenants available</p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Tenant</label>
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a tenant</option>
              {availableTenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name} - {tenant.email} - {tenant.phone}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button onClick={onClose} className="bg-gray-500 hover:bg-gray-600">
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

// Add/Edit Room Modal
const RoomFormModal = ({ isOpen, onClose, room, onSuccess }: {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState({
    number: '',
    type: 'SINGLE',
    rent: '',
    deposit: '',
    floor: '',
    amenities: [] as string[]
  });
  const [loading, setLoading] = useState(false);

  const roomTypes = [
    { value: 'SINGLE', label: 'Single Sharing', capacity: 1 },
    { value: 'DOUBLE', label: 'Double Sharing', capacity: 2 },
    { value: 'TRIPLE', label: 'Triple Sharing', capacity: 3 },
    { value: 'FOUR', label: 'Four Sharing', capacity: 4 }
  ];

  const amenitiesList = [
    'Wi-Fi', 'AC', 'TV', 'Refrigerator', 'Washing Machine', 
    'Balcony', 'Attached Bathroom', 'Study Table', 'Wardrobe'
  ];

  useEffect(() => {
    if (room) {
      setFormData({
        number: room.number || '',
        type: room.type || 'SINGLE',
        rent: room.rent?.toString() || '',
        deposit: room.deposit?.toString() || '',
        floor: room.floor?.toString() || '',
        amenities: room.amenities || []
      });
    } else {
      setFormData({
        number: '',
        type: 'SINGLE',
        rent: '',
        deposit: '',
        floor: '',
        amenities: []
      });
    }
  }, [room, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.number || !formData.rent) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const roomData = {
        ...formData,
        rent: parseFloat(formData.rent),
        deposit: parseFloat(formData.deposit) || 0,
        floor: parseInt(formData.floor) || 1,
        capacity: roomTypes.find(type => type.value === formData.type)?.capacity || 1
      };

      if (room) {
        await roomService.updateRoom(room.id, roomData);
      } else {
        await roomService.createRoom(roomData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving room:', error);
      alert('Error saving room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={room ? 'Edit Room' : 'Add New Room'} size="lg">
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Number *</label>
            <Input name="number" value={formData.number} onChange={handleInputChange} placeholder="e.g., 101" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            >
              {roomTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Rent (₹) *</label>
            <Input name="rent" type="number" value={formData.rent} onChange={handleInputChange} placeholder="e.g., 8000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Deposit (₹)</label>
            <Input name="deposit" type="number" value={formData.deposit} onChange={handleInputChange} placeholder="e.g., 8000" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
          <Input name="floor" type="number" value={formData.floor} onChange={handleInputChange} placeholder="e.g., 1" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
          <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
            {amenitiesList.map(amenity => (
              <div key={amenity} className="flex items-center">
                <input
                  type="checkbox"
                  id={`amenity-${amenity}`}
                  checked={formData.amenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor={`amenity-${amenity}`} className="ml-2 text-sm text-gray-900">{amenity}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button onClick={onClose} className="bg-gray-500 hover:bg-gray-600">Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
            {loading ? (room ? 'Updating...' : 'Creating...') : (room ? 'Update Room' : 'Create Room')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Main Room Management Component
const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  
  // Modal states
  const [modals, setModals] = useState({
    details: false,
    form: false,
    assign: false,
    delete: false
  });
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [rooms, searchTerm, statusFilter, typeFilter]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const roomsData = await roomService.getAllRooms();
      setRooms(roomsData);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRooms = () => {
    let filtered = rooms;

    if (searchTerm) {
      filtered = filtered.filter(room => 
        room.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(room => room.status === statusFilter);
    }

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(room => room.type === typeFilter);
    }

    setFilteredRooms(filtered);
  };

  const openModal = (modalName: string, room: Room | null = null) => {
    setSelectedRoom(room);
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName: string) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    setSelectedRoom(null);
  };

  const handleDeleteRoom = async () => {
    if (!selectedRoom) return;

    try {
      await roomService.deleteRoom(selectedRoom.id);
      fetchRooms();
      closeModal('delete');
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Error deleting room. Please try again.');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'default';
      case 'OCCUPIED':
        return 'secondary';
      case 'MAINTENANCE':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getOccupancyColor = (occupancy: number, capacity: number) => {
    const percentage = (occupancy / capacity) * 100;
    if (percentage === 100) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    return 'text-green-600';
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Room Management</h1>
        <Button 
          onClick={() => openModal('form')}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Room
        </Button>
      </div>

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
          </div>
        </CardContent>
      </Card>

      {/* Room Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
              </div>
              <Building className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">
                  {rooms.filter(r => r.status === 'AVAILABLE').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupied</p>
                <p className="text-2xl font-bold text-blue-600">
                  {rooms.filter(r => r.status === 'OCCUPIED').length}
                </p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{rooms.reduce((sum, room) => sum + Number(room.rent || 0), 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

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
                          {room.floor && <div className="text-sm text-gray-500">Floor {room.floor}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-500 mt-1">
                        Capacity: {room.capacity}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {room.type?.replace('_', ' ')}
                      </Badge>                      
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getOccupancyColor(room.occupancy || 0, room.capacity || 1)}`}>
                        {room.occupancy || 0} / {room.capacity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        ₹{room.rent?.toLocaleString()}
                      </span>
                      <div className="text-xs text-gray-500">per month</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusBadgeVariant(room.status || '')}>
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
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openModal('form', room)}
                          className="p-1"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>

                        {room.status === 'AVAILABLE' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openModal('assign', room)}
                            className="p-1 text-green-600 hover:text-green-700"
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openModal('delete', room)}
                          className="p-1 text-red-600 hover:text-red-700"
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
      />

      <RoomFormModal
        isOpen={modals.form}
        onClose={() => closeModal('form')}
        room={selectedRoom}
        onSuccess={fetchRooms}
      />

      <AssignTenantModal
        isOpen={modals.assign}
        onClose={() => closeModal('assign')}
        room={selectedRoom}
        onSuccess={fetchRooms}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={modals.delete}
        onClose={() => closeModal('delete')}
        title="Delete Room"
        size="sm"
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Delete Room</h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete Room {selectedRoom?.number}? This action cannot be undone.
              </p>
            </div>
          </div>
          
          {selectedRoom?.status === 'OCCUPIED' && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-sm text-red-800">
                Warning: This room is currently occupied. Please reassign the tenant before deleting.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => closeModal('delete')}
              className="bg-gray-500 hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteRoom}
              disabled={selectedRoom?.status === 'OCCUPIED'}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Room
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default RoomManagement