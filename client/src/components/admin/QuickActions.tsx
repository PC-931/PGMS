import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Building, User, FileText, X } from 'lucide-react';
import { roomService } from '../../services/roomService';
import { tenantService } from '../../services/tenantService';

// Modal Component
const Modal = ({ isOpen, onClose, children, title }: { 
  isOpen: boolean; 
  onClose: () => void; 
  children: React.ReactNode; 
  title: string; 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
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

// Add Room Modal
const AddRoomModal = ({ isOpen, onClose, onSuccess }: { 
  isOpen: boolean; 
  onClose: () => void;
  onSuccess: () => void; 
}) => {
  const [formData, setFormData] = useState({
    number: '',
    type: 'SINGLE',
    rent: '',
    deposit: 1000,
    floor: 1,
    amenities: []
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'type' && {
        capacity: roomTypes.find(type => type.value === value)?.capacity || 1
      })
    }));
  };

  const handleAmenityToggle = (amenity) => {
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
        deposit: parseFloat(formData.deposit),
        floor: parseInt(formData.floor)
      };
      
      await roomService.createRoom(roomData);
      
      setFormData({
        number: '',
        type: 'SINGLE',
        deposit: 1,
        rent: '',
        floor: 1,
        amenities: []
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Error creating room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Room">
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Room Number *</label>
          <Input name="number" value={formData.number} onChange={handleInputChange} placeholder="e.g., 101" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Rent (₹) *</label>
          <Input name="rent" type="number" value={formData.rent} onChange={handleInputChange} placeholder="e.g., 8000" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Deposit (₹) *</label>
          <Input name="deposit" type="number" value={formData.deposit} onChange={handleInputChange} placeholder="e.g., 8000" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Floor *</label>
          <Input name="floor" type="number" value={formData.floor} onChange={handleInputChange} placeholder="e.g., 4" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
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
            {loading ? 'Creating...' : 'Create Room'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Register Tenant Modal
const RegisterTenantModal = ({ isOpen, onClose, onSuccess }: { 
  isOpen: boolean; 
  onClose: () => void;
  onSuccess: () => void; 
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    roomId: '',
    emergencyContact: '',
    role: 'TENANT',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);

  React.useEffect(() => {
    if (isOpen) {
      // Fetch available rooms when modal opens
      fetchAvailableRooms();
    }
  }, [isOpen]);

  const fetchAvailableRooms = async () => {
    try {
      const rooms = await roomService.getAllRooms();
      // Filter only available rooms
      setAvailableRooms(rooms.filter(room => room.status === 'AVAILABLE'));
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password || !formData.roomId) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      var res = await tenantService.createTenant(formData);
      console.log('Tenant created:', res);
      await roomService.assignTenant(formData.roomId, res.id)
      
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        roomId: '',
        emergencyContact: '',
        role: 'TENANT',
        address: ''
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error registering tenant:', error);
      alert('Error registering tenant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register New Tenant">
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
            <Input name="firstName" value={formData.firstName} onChange={handleInputChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
            <Input name="lastName" value={formData.lastName} onChange={handleInputChange} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <Input name="email" type="email" value={formData.email} onChange={handleInputChange} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
          <Input name="phone" type="tel" value={formData.phone} onChange={handleInputChange} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
          <Input name="password" type="password" value={formData.password} onChange={handleInputChange} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Assign Room *</label>
          <select
            name="roomId"
            value={formData.roomId}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select a room</option>
            {availableRooms.map(room => (
              <option key={room.id} value={room.id}>
                Room {room.number} - {room.type} (₹{room.rent}/month)
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button onClick={onClose} className="bg-gray-500 hover:bg-gray-600">Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
            {loading ? 'Registering...' : 'Register Tenant'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Generate Report Modal
const GenerateReportModal = ({ isOpen, onClose }: { 
  isOpen: boolean; 
  onClose: () => void;
}) => {
  const [reportConfig, setReportConfig] = useState({
    type: 'monthly_revenue',
    period: 'current_month',
    format: 'pdf'
  });
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    { value: 'monthly_revenue', label: 'Monthly Revenue Report' },
    { value: 'occupancy', label: 'Occupancy Report' },
    { value: 'tenant_list', label: 'Tenant List Report' },
    { value: 'payment_status', label: 'Payment Status Report' }
  ];

  const periodOptions = [
    { value: 'current_month', label: 'Current Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'last_3_months', label: 'Last 3 Months' },
    { value: 'current_year', label: 'Current Year' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReportConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Mock report generation - replace with actual API call
      console.log('Generating report:', reportConfig);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      alert('Report generated successfully!');
      onClose();
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Report">
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
          <select
            name="type"
            value={reportConfig.type}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          >
            {reportTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
          <select
            name="period"
            value={reportConfig.period}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          >
            {periodOptions.map(period => (
              <option key={period.value} value={period.value}>{period.label}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button onClick={onClose} className="bg-gray-500 hover:bg-gray-600">Cancel</Button>
          <Button onClick={handleGenerate} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
            <FileText className="mr-2 h-4 w-4" />
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Main Quick Actions Component
const QuickActions = ({ onDataUpdate }) => {
  const [modals, setModals] = useState({
    addRoom: false,
    registerTenant: false,
    generateReport: false
  });

  const openModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  };

  const handleSuccess = () => {
    // Callback to refresh dashboard data
    onDataUpdate?.();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <button 
              onClick={() => openModal('addRoom')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center space-x-3"
            >
              <Building className="h-5 w-5 text-indigo-600" />
              <div>
                <div className="font-medium text-gray-900">Add New Room</div>
                <div className="text-sm text-gray-500">Create a new room listing</div>
              </div>
            </button>
            
            <button 
              onClick={() => openModal('registerTenant')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center space-x-3"
            >
              <User className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-gray-900">Register Tenant</div>
                <div className="text-sm text-gray-500">Add a new tenant to the system</div>
              </div>
            </button>
            
            <button 
              onClick={() => openModal('generateReport')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center space-x-3"
            >
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">Generate Report</div>
                <div className="text-sm text-gray-500">Create monthly revenue report</div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <AddRoomModal
        isOpen={modals.addRoom}
        onClose={() => closeModal('addRoom')}
        onSuccess={handleSuccess}
      />

      <RegisterTenantModal
        isOpen={modals.registerTenant}
        onClose={() => closeModal('registerTenant')}
        onSuccess={handleSuccess}
      />

      <GenerateReportModal
        isOpen={modals.generateReport}
        onClose={() => closeModal('generateReport')}
      />
    </>
  );
};

export default QuickActions;
