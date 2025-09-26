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
  tenantId?: string;
  createdAt: Date;
  updatedAt: Date;
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
