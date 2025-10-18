
import api from './api';
import { RoomSummary, Tenant, TenantStats, UnassignedTenant } from '../types';

/**
 * TenantService
 * Handles all tenant-related API operations with comprehensive error handling
 * and data transformation utilities.
 */
class TenantService {
  private baseURL = '/admin/tenants';

  /**
   * Get all tenants with room information and statistics
   * @throws Error if API call fails
   */
  async getAllTenants(): Promise<Tenant[]> {
    try {
      const response = await api.get(this.baseURL);
      
      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format');
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch tenants');
    }
  }

  /**
   * Get tenant by ID with detailed room information
   * @param id - Tenant ID
   * @throws Error if tenant not found or API call fails
   */
  async getTenantById(id: string): Promise<Tenant> {
    try {
      const response = await api.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Failed to fetch tenant ${id}`);
    }
  }

  /**
   * Create a new tenant
   * @param tenantData - Tenant creation data
   * @throws Error if validation fails or API call fails
   */
  async createTenant(tenantData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<Tenant> {
    try {
      // Validate input
      const errors = this.validateTenantData(tenantData);
      if (errors.length > 0) {
        throw new Error(errors[0]);
      }

      const response = await api.post(this.baseURL, {
        ...tenantData,
        role: 'TENANT'
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to create tenant');
    }
  }

  /**
   * Update tenant information
   * @param id - Tenant ID
   * @param tenantData - Tenant update data
   * @throws Error if validation fails or API call fails
   */
  async updateTenant(
    id: string,
    tenantData: Partial<{
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    }>
  ): Promise<Tenant> {
    try {
      // Validate at least one field is provided
      if (Object.keys(tenantData).length === 0) {
        throw new Error('No fields to update');
      }

      const response = await api.put(`${this.baseURL}/${id}`, tenantData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to update tenant');
    }
  }

  /**
   * Delete a tenant
   * Only works if tenant is not assigned to any room
   * @param id - Tenant ID
   * @throws Error if tenant has rooms or API call fails
   */
  async deleteTenant(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseURL}/${id}`);
    } catch (error) {
      throw this.handleError(error, 'Failed to delete tenant');
    }
  }

  /**
   * Get tenants not assigned to any room
   * @throws Error if API call fails
   */
  async getUnassignedTenants(): Promise<UnassignedTenant[]> {
    try {
      const response = await api.get(`${this.baseURL}/unassigned`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch unassigned tenants');
    }
  }

  /**
   * Get tenant statistics
   * @throws Error if API call fails
   */
  async getTenantStats(): Promise<TenantStats> {
    try {
      const response = await api.get(`${this.baseURL}/stats/overview`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch tenant statistics');
    }
  }

  /**
   * Format tenant display name
   * @param tenant - Tenant object
   */
  getDisplayName(tenant: Pick<Tenant, 'firstName' | 'lastName'>): string {
    return `${tenant.firstName} ${tenant.lastName}`.trim();
  }

  /**
   * Format tenant contact info for display
   * @param tenant - Tenant object
   */
  getContactInfo(tenant: Pick<Tenant, 'email' | 'phone'>): string {
    const parts = [tenant.email];
    if (tenant.phone) {
      parts.push(tenant.phone);
    }
    return parts.join(' • ');
  }

  /**
   * Get room assignment summary for a tenant
   * @param rooms - Array of room summaries
   */
  getRoomAssignmentSummary(rooms: RoomSummary[]): string {
    if (rooms.length === 0) {
      return 'No room assigned';
    }

    if (rooms.length === 1) {
      return `Room ${rooms[0].number}`;
    }

    return `${rooms.length} rooms: ${rooms.map(r => r.number).join(', ')}`;
  }

  /**
   * Get tenant assignment status
   * @param rooms - Array of room summaries
   */
  getAssignmentStatus(rooms: RoomSummary[]): 'unassigned' | 'assigned' | 'multiple' {
    if (rooms.length === 0) return 'unassigned';
    if (rooms.length === 1) return 'assigned';
    return 'multiple';
  }

  /**
   * Get status badge variant for tenant
   * @param status - Assignment status
   */
  getStatusBadgeVariant(status: 'unassigned' | 'assigned' | 'multiple'): string {
    switch (status) {
      case 'assigned':
        return 'default';
      case 'multiple':
        return 'secondary';
      case 'unassigned':
        return 'outline';
      default:
        return 'outline';
    }
  }

  /**
   * Calculate total rent for a tenant across all rooms
   * @param rooms - Array of room summaries
   */
  calculateTotalRent(rooms: RoomSummary[]): number {
    return rooms.reduce((total, room) => total + (room.rent || 0), 0);
  }

  /**
   * Validate tenant data before submission
   * @param data - Tenant data to validate
   */
  validateTenantData(data: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): string[] {
    const errors: string[] = [];

    if (!data.email?.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Invalid email format');
    }

    if (!data.firstName?.trim()) {
      errors.push('First name is required');
    }

    if (!data.lastName?.trim()) {
      errors.push('Last name is required');
    }

    if (data.phone && !/^[\d\s\-\+\(\)]+$/.test(data.phone)) {
      errors.push('Invalid phone number format');
    }

    return errors;
  }

  /**
   * Search tenants by name or email
   * @param tenants - Array of tenants to search
   * @param searchTerm - Search term
   */
  searchTenants(tenants: Tenant[], searchTerm: string): Tenant[] {
    if (!searchTerm.trim()) return tenants;

    const term = searchTerm.toLowerCase();
    return tenants.filter(tenant =>
      tenant.firstName.toLowerCase().includes(term) ||
      tenant.lastName.toLowerCase().includes(term) ||
      tenant.email.toLowerCase().includes(term) ||
      (tenant.phone && tenant.phone.includes(term))
    );
  }

  /**
   * Filter tenants by assignment status
   * @param tenants - Array of tenants to filter
   * @param status - Filter status
   */
  filterTenantsByStatus(
    tenants: Tenant[],
    status: 'all' | 'assigned' | 'unassigned'
  ): Tenant[] {
    if (status === 'all') return tenants;

    return tenants.filter(tenant => {
      const hasRooms = tenant.rooms.length > 0;
      return status === 'assigned' ? hasRooms : !hasRooms;
    });
  }

  /**
   * Sort tenants by various criteria
   * @param tenants - Array of tenants to sort
   * @param sortBy - Sort field
   * @param direction - Sort direction
   */
  sortTenants(
    tenants: Tenant[],
    sortBy: 'name' | 'email' | 'rooms' | 'created',
    direction: 'asc' | 'desc' = 'asc'
  ): Tenant[] {
    const sorted = [...tenants].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
          comparison = nameA.localeCompare(nameB);
          break;
        case 'email':
          comparison = a.email.toLowerCase().localeCompare(b.email.toLowerCase());
          break;
        case 'rooms':
          comparison = a.rooms.length - b.rooms.length;
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return direction === 'desc' ? -comparison : comparison;
    });

    return sorted;
  }

  /**
   * Handle API errors with meaningful messages
   * @param error - Error object
   * @param defaultMessage - Default error message
   */
  private handleError(error: unknown, defaultMessage: string): Error {
    if (error instanceof Error) {
      // If error has response data with a message
      if ('response' in error && error.response && typeof error.response === 'object') {
        const response = error.response as any;
        if (response.data?.error) {
          return new Error(response.data.error);
        }
        if (response.data?.message) {
          return new Error(response.data.message);
        }
      }
      return error;
    }

    return new Error(defaultMessage);
  }
}

export const tenantService = new TenantService();