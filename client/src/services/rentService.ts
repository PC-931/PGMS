// File: client/src/services/rentService.ts

import api from './api';
import {
  Rent,
  CreateRentData,
  UpdateRentData,
  CreatePaymentData,
  RentFilters,
  RentPaginatedResponse,
  MonthlySummary,
  RentInvoice
} from '../types/rent';

class RentService {
  private baseURL = '/admin/rents';

  /**
   * Get all rents with filters and pagination
   */
  async getAllRents(filters: RentFilters = {}): Promise<RentPaginatedResponse> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await api.get(`${this.baseURL}?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch rents');
    }
  }

  /**
   * Get rent by ID
   */
  async getRentById(id: string): Promise<Rent> {
    try {
      const response = await api.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch rent details');
    }
  }

  /**
   * Create new rent
   */
  async createRent(data: CreateRentData): Promise<Rent> {
    try {
      const response = await api.post(this.baseURL, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create rent');
    }
  }

  /**
   * Update rent
   */
  async updateRent(id: string, data: UpdateRentData): Promise<Rent> {
    try {
      const response = await api.put(`${this.baseURL}/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update rent');
    }
  }

  /**
   * Delete rent
   */
  async deleteRent(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseURL}/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete rent');
    }
  }

  /**
   * Add payment to rent
   */
  async addPayment(rentId: string, data: CreatePaymentData): Promise<{ payment: any; rent: Rent }> {
    try {
      const response = await api.post(`${this.baseURL}/${rentId}/payments`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to record payment');
    }
  }

  /**
   * Generate invoice
   */
  async generateInvoice(rentId: string): Promise<RentInvoice> {
    try {
      const response = await api.get(`${this.baseURL}/${rentId}/invoice`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to generate invoice');
    }
  }

  /**
   * Get monthly summary
   */
  async getMonthlySummary(month: number, year: number): Promise<MonthlySummary> {
    try {
      const response = await api.get(`${this.baseURL}/summary/monthly`, {
        params: { month, year }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch monthly summary');
    }
  }

  /**
   * Update overdue rents
   */
  async updateOverdueRents(): Promise<{ message: string; count: number }> {
    try {
      const response = await api.post(`${this.baseURL}/update-overdue`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update overdue rents');
    }
  }

  /**
   * Helper: Format rent amount with currency
   */
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Helper: Format date
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  /**
   * Helper: Get status color
   */
  getStatusColor(status: string): string {
    const colors = {
      PAID: 'text-green-600 bg-green-100',
      PENDING: 'text-yellow-600 bg-yellow-100',
      PARTIAL: 'text-blue-600 bg-blue-100',
      OVERDUE: 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  }

  /**
   * Helper: Get status badge variant
   */
  getStatusBadgeVariant(status: string): 'default' | 'success' | 'warning' | 'destructive' {
    const variants = {
      PAID: 'success' as const,
      PENDING: 'warning' as const,
      PARTIAL: 'default' as const,
      OVERDUE: 'destructive' as const
    };
    return variants[status] || 'default';
  }

  /**
   * Helper: Check if rent is overdue
   */
  isOverdue(dueDate: string, status: string): boolean {
    if (status === 'PAID') return false;
    return new Date(dueDate) < new Date();
  }

  /**
   * Helper: Calculate days overdue
   */
  getDaysOverdue(dueDate: string): number {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  /**
   * Helper: Get payment method display name
   */
  getPaymentMethodName(method: string): string {
    const methods = {
      CASH: 'Cash',
      CARD: 'Card',
      UPI: 'UPI',
      BANK_TRANSFER: 'Bank Transfer',
      CHEQUE: 'Cheque'
    };
    return methods[method] || method;
  }
}

export const rentService = new RentService();