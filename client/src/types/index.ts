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

export interface Room {
  id: string
  type: 'Single' | 'Double' | 'Triple' | 'Four'
  capacity: number
  occupancy: number
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTAINANCE'
  rent: number
  createdAt: string
  updatedAt: string
}

export interface Tenant {
  id: string
  name: string
  email: string
  phone: string
  roomId: string | null
  room?: Room
  // status: 'Active' | 'Inactive'
  // joinedAt: string
  createdAt: string
  updatedAt: string
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

export interface DashboardStats {
  totalRooms: number
  occupiedRooms: number
  availableRooms: number
  totalTenants: number
  //activeTenants: number
  totalRevenue: number
  // pendingRent: number
  pendingPayments: number
  // maintenanceRooms: number
  occupancyRate: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
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
