export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'TENANT'
  createdAt: string
  updatedAt: string
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
  role?: 'ADMIN' | 'TENANT'
}

export interface Tenant {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'TENANT';
  rooms: RoomSummary[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    payments: number;
    maintenanceRequests: number;
  };
}

export interface UnassignedTenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export interface TenantStats {
  totalTenants: number;
  assignedTenants: number;
  unassignedTenants: number;
  assignmentRate: number;
}

export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'TENANT'
  createdAt: string
  updatedAt: string
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
  role?: 'ADMIN' | 'TENANT'
}

// Room related types
export interface Room {
  id: string;
  number: string;
  type: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'FOUR';
  rent: number;
  deposit: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  floor: number;
  amenities: string[];
  
  // Occupancy tracking
  maxOccupancy: number;
  currentOccupancy: number;
  availableSpots: number;
  isFullyOccupied: boolean;
  
  // Relations
  tenants?: TenantSummary[];
  
  createdAt: string;
  updatedAt: string;
}

export interface Room extends RoomOccupancy {
  id: string;
  number: string;
  type: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'FOUR';
  rent: number;
  deposit: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  floor: number;
  amenities: string[];
  tenants?: TenantSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface OccupancyStats {
  totalRooms: number;
  totalCapacity: number;
  totalOccupied: number;
  availableSpots: number;
  occupancyRate: number;
  roomsByStatus: {
    available: number;
    partiallyOccupied: number;
    fullyOccupied: number;
    maintenance: number;
  };
}


// Filter and search types
export interface RoomFilters {
  search: string;
  status: 'ALL' | 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  type: 'ALL' | 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'FOUR';
  occupancy: 'ALL' | 'EMPTY' | 'PARTIAL' | 'FULL';
}

export interface TenantFilters {
  search: string;
  status: 'ALL' | 'ASSIGNED' | 'UNASSIGNED';
  sortBy: 'name' | 'email' | 'rooms' | 'created';
  sortDirection: 'asc' | 'desc';
}

// Component prop types
export interface RoomCardProps {
  room: Room;
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
  onViewDetails: (room: Room) => void;
  onAssignTenant: (room: Room) => void;
  onReleaseTenant: (room: Room, tenant: TenantSummary) => void;
}

export interface TenantCardProps {
  tenant: Tenant;
  onEdit: (tenant: Tenant) => void;
  onDelete: (tenant: Tenant) => void;
  onViewDetails: (tenant: Tenant) => void;
  onAssignRoom: (tenant: Tenant) => void;
}


export interface RoomAssignmentRequest {
  tenantId: string;
}

export interface RoomAssignmentResponse {
  message: string;
  room: Room;
}

export interface RentRecord {
  id: string
  tenantId: string
  tenant?: Tenant
  roomId: string
  room?: Room
  month: string
  amount: number
  status: 'Paid' | 'Pending' | 'Overdue'
  paidAt?: string
  createdAt: string
  updatedAt: string
}

// Payment and maintenance types (for future use)
export interface Payment {
  id: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  type: 'RENT' | 'DEPOSIT' | 'MAINTENANCE';
  tenantId: string;
  roomId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  tenantId: string;
  roomId: string;
  createdAt: string;
  updatedAt: string;
}

// Utility types
export type RoomType = Room['type'];
export type RoomStatus = Room['status'];
export type UserRole = 'ADMIN' | 'TENANT';

// Room type configuration
export interface RoomTypeConfig {
  name: string;
  capacity: number;
  icon: string;
  description?: string;
}

export const ROOM_TYPES: Record<RoomType, RoomTypeConfig> = {
  SINGLE: {
    name: 'Single Sharing',
    capacity: 1,
    icon: '👤',
    description: 'Private room for one person'
  },
  DOUBLE: {
    name: 'Double Sharing',
    capacity: 2,
    icon: '👥',
    description: 'Shared room for two people'
  },
  TRIPLE: {
    name: 'Triple Sharing',
    capacity: 3,
    icon: '👨‍👩‍👧',
    description: 'Shared room for three people'
  },
  FOUR: {
    name: 'Four Sharing',
    capacity: 4,
    icon: '👨‍👩‍👧‍👦',
    description: 'Shared room for four people'
  }
};

export interface DashboardStats {
  rooms: {
    total: number;
    available: number;
    occupied: number;
    maintenance: number;
  };
  tenants: TenantStats;
  occupancy: OccupancyStats;
  revenue: {
    monthly: number;
    pending: number;
    collected: number;
  };
  maintenance: {
    pending: number;
    inProgress: number;
    completed: number;
  };
}

// Form related types
export interface RoomFormData {
  number: string;
  type: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'FOUR';
  rent: string;
  deposit: string;
  floor: string;
  amenities: string[];
}

export interface TenantFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

// Modal types
export interface ModalState {
  [key: string]: boolean;
}


export interface ApiResponse<T> {
  success?: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface SearchFilters {
  search?: string
  status?: string
  roomType?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface ReportConfig {
  type: 'monthly_revenue' | 'occupancy' | 'tenant_list' | 'maintenance' | 'payment_status';
  period: 'current_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'current_year' | 'custom';
  format: 'pdf' | 'excel' | 'csv';
  includeDetails?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface ReportData {
  id: string;
  type: string;
  period: string;
  generatedAt: string;
  filePath: string;
  fileName: string;
  format: string;
}

export interface CreateRoomData {
  number: string;
  type: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'FOUR';
  capacity: number;
  rent: number;
  deposit?: number;
  floor?: number;
  description?: string;
  amenities?: string[];
}

export interface UpdateRoomData extends Partial<CreateRoomData> {
  status?: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  tenantId?: string;
  occupancy?: number;
}

export interface CreateTenantData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  roomId?: string;
  emergencyContact?: string;
  address?: string;
  role?: 'TENANT';
}

export interface UpdateTenantData extends Partial<CreateTenantData> {
  status?: 'ACTIVE' | 'INACTIVE';
}

// Activity log interface for dashboard
export interface ActivityLog {
  id: string;
  type: 'payment' | 'maintenance' | 'tenant' | 'room';
  message: string;
  timestamp: string;
  userId?: string;
  metadata?: Record<string, any>;
}

// Notification interface
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  userId: string;
}


export interface ReportConfig {
  type: 'monthly_revenue' | 'occupancy' | 'tenant_list' | 'maintenance' | 'payment_status';
  period: 'current_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'current_year' | 'custom';
  format: 'pdf' | 'excel' | 'csv';
  includeDetails?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface ReportData {
  id: string;
  type: string;
  period: string;
  generatedAt: string;
  filePath: string;
  fileName: string;
  format: string;
}

export interface CreateRoomData {
  number: string;
  type: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'FOUR';
  capacity: number;
  rent: number;
  description?: string;
  amenities: string[];
}

export interface CreateTenantData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  roomId: string;
  emergencyContact?: string;
  address?: string;
}

export interface RoomOccupancy {
  maxOccupancy: number;
  currentOccupancy: number;
  availableSpots: number;
  isFullyOccupied: boolean;
}

export interface TenantSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface RoomSummary {
  id: string;
  number: string;
  type: string;
  floor: number;
  rent?: number;
  status?: string;
}