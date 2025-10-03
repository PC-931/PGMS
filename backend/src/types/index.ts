export interface User {
  id: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'TENANT';
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Room {
  id: string;
  number: string;
  type: string;
  rent: number;
  deposit: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  floor: number;
  amenities: string[];
  // tenantId?: string;
  createdAt: Date;
  updatedAt: Date;

  // Occupancy tracking
  maxOccupancy: number;
  currentOccupancy: number;
  availableSpots: number;
  isFullyOccupied: boolean;
  
  // Relations
  tenants?: TenantSummary[];
  tenant?: TenantSummary; // For backward compatibility
}

export interface TenantSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface TenantWithRooms extends User {
  rooms: RoomSummary[];
  _count?: {
    payments: number;
    maintenanceRequests: number;
  };
}

export interface RoomSummary {
  id: string;
  number: string;
  type: string;
  floor: number;
  rent?: number;
  status?: string;
}

export interface Payment {
  id: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  type: 'RENT' | 'DEPOSIT' | 'MAINTENANCE';
  tenantId: string;
  roomId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  tenantId: string;
  roomId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'TENANT';
}


// Occupancy Statistics
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

export interface TenantStats {
  totalTenants: number;
  assignedTenants: number;
  unassignedTenants: number;
  assignmentRate: number;
}

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

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Room Assignment Types
export interface RoomAssignmentRequest {
  tenantId: string;
  roomId: string;
}

export interface RoomAssignmentResponse {
  message: string;
  room: Room;
  tenant: TenantSummary;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ReportConfig {
  type: 'monthly_revenue' | 'occupancy' | 'tenant_list' | 'maintenance' | 'payment_status';
  period: 'current_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'current_year' | 'custom';
  format: 'pdf' | 'excel' | 'csv';
  includeDetails?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface ReportData {
  id: string;
  type: string;
  period: string;
  generatedAt: Date;
  filePath: string;
  fileName: string;
  format: string;
}
