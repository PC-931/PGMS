
import api from './api';
import { RoomSummary, Tenant, TenantStats, UnassignedTenant } from '../types';

class TenantService {
  private baseURL = 'admin/tenants';

  /**
   * Get all tenants with room information
   */
  async getAllTenants(): Promise<Tenant[]> {
    const response = await api.get(this.baseURL);
    return response.data;
  }

  /**
   * Get tenant by ID with detailed room information
   */
  async getTenantById(id: string): Promise<Tenant> {
    const response = await api.get(`${this.baseURL}/${id}`);
    return response.data;
  }

  /**
   * Create a new tenant
   */
  async createTenant(tenantData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<Tenant> {
    const response = await api.post(this.baseURL, {
      ...tenantData,
      role: 'TENANT'
    });
    return response.data;
  }

  /**
   * Update tenant information
   */
  async updateTenant(id: string, tenantData: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }>): Promise<Tenant> {
    const response = await api.put(`${this.baseURL}/${id}`, tenantData);
    return response.data;
  }

  /**
   * Delete a tenant
   */
  async deleteTenant(id: string): Promise<void> {
    await api.delete(`${this.baseURL}/${id}`);
  }

  /**
   * Get tenants not assigned to any room
   */
  async getUnassignedTenants(): Promise<UnassignedTenant[]> {
    const response = await api.get(`${this.baseURL}/unassigned`);
    return response.data;
  }

  /**
   * Get tenant statistics
   */
  async getTenantStats(): Promise<TenantStats> {
    const response = await api.get(`${this.baseURL}/stats`);
    return response.data;
  }

  /**
   * Format tenant display name
   */
  getDisplayName(tenant: Pick<Tenant, 'firstName' | 'lastName'>): string {
    return `${tenant.firstName} ${tenant.lastName}`.trim();
  }

  /**
   * Format tenant contact info for display
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
   */
  getAssignmentStatus(rooms: RoomSummary[]): 'unassigned' | 'assigned' | 'multiple' {
    if (rooms.length === 0) return 'unassigned';
    if (rooms.length === 1) return 'assigned';
    return 'multiple';
  }

  /**
   * Get status badge variant for tenant
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
   */
  calculateTotalRent(rooms: RoomSummary[]): number {
    return rooms.reduce((total, room) => total + (room.rent || 0), 0);
  }

  /**
   * Validate tenant data before submission
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
   */
  filterTenantsByStatus(tenants: Tenant[], status: 'all' | 'assigned' | 'unassigned'): Tenant[] {
    if (status === 'all') return tenants;
    
    return tenants.filter(tenant => {
      const hasRooms = tenant.rooms.length > 0;
      return status === 'assigned' ? hasRooms : !hasRooms;
    });
  }

  /**
   * Sort tenants by various criteria
   */
  sortTenants(tenants: Tenant[], sortBy: 'name' | 'email' | 'rooms' | 'created', direction: 'asc' | 'desc' = 'asc'): Tenant[] {
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
}

export const tenantService = new TenantService();

