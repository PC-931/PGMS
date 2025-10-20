// File: backend/src/types/rent.types.ts

import { RentStatus } from '@prisma/client';

export interface CreateRentDto {
  tenantId: string;
  roomId: string;
  amount: number;
  periodStart: Date | string;
  periodEnd: Date | string;
  dueDate: Date | string;
  notes?: string;
}

export interface UpdateRentDto {
  amount?: number;
  periodStart?: Date | string;
  periodEnd?: Date | string;
  dueDate?: Date | string;
  status?: RentStatus;
  notes?: string;
}

export interface CreateRentPaymentDto {
  amount: number;
  paidAt: Date | string;
  method: string;
  reference?: string;
  notes?: string;
}

export interface RentFilterDto {
  tenantId?: string;
  roomId?: string;
  status?: RentStatus;
  startDate?: Date | string;
  endDate?: Date | string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'dueDate' | 'amount' | 'status' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface RentWithRelations {
  id: string;
  tenantId: string;
  roomId: string;
  amount: number;
  paidAmount: number;
  periodStart: Date;
  periodEnd: Date;
  dueDate: Date;
  status: RentStatus;
  notes?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
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
  rentPayments: {
    id: string;
    amount: number;
    paidAt: Date;
    method: string;
    reference?: string;
    notes?: string;
  }[];
  outstandingAmount: number;
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
    start: Date;
    end: Date;
  };
  amount: number;
  paidAmount: number;
  outstandingAmount: number;
  dueDate: Date;
  status: RentStatus;
  payments: {
    date: Date;
    amount: number;
    method: string;
    reference?: string;
  }[];
  generatedAt: Date;
}