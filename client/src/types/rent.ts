// File: client/src/types/rent.ts

export type RentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
export type PaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE';

export interface RentPayment {
  id: string;
  amount: number;
  paidAt: string;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface Rent {
  id: string;
  tenantId: string;
  roomId: string;
  amount: number;
  paidAmount: number;
  outstandingAmount: number;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  status: RentStatus;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  room: {
    id: string;
    number: string;
    type: string;
    floor: number;
  };
  rentPayments: RentPayment[];
}

export interface CreateRentData {
  tenantId: string;
  roomId: string;
  amount: number;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  notes?: string;
}

export interface UpdateRentData {
  amount?: number;
  periodStart?: string;
  periodEnd?: string;
  dueDate?: string;
  status?: RentStatus;
  notes?: string;
}

export interface CreatePaymentData {
  amount: number;
  paidAt: string;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface RentFilters {
  tenantId?: string;
  roomId?: string;
  status?: RentStatus | 'ALL';
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'dueDate' | 'amount' | 'status' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface RentPaginatedResponse {
  rents: Rent[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MonthlySummary {
  month: string;
  year: number;
  totalExpected: number;
  totalCollected: number;
  totalOutstanding: number;
  totalOverdue: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  partialCount: number;
}

export interface RentInvoice {
  rentId: string;
  invoiceNumber: string;
  tenant: {
    name: string;
    email: string;
    phone?: string;
  };
  room: {
    number: string;
    type: string;
  };
  period: {
    start: string;
    end: string;
  };
  amount: number;
  paidAmount: number;
  outstandingAmount: number;
  dueDate: string;
  status: RentStatus;
  payments: {
    date: string;
    amount: number;
    method: string;
    reference?: string;
  }[];
  generatedAt: string;
}