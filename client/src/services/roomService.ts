import api from './api';
import {OccupancyStats, Room, RoomAssignmentResponse } from '../types';
class RoomService {
  private baseURL = 'admin/rooms'; // since api.ts already has /api

    /**
     * Get all rooms with occupancy details
    */
    async getAllRooms(): Promise<Room[]> {
        const response = await api.get(this.baseURL);
        return response.data;
    }

    /**
     * Get room by ID with occupancy details
    */
    async getRoomById(id: string): Promise<Room> {
        const response = await api.get(`${this.baseURL}/${id}`);
        return response.data;
    }
    
    /**
     * Create a new room
     */
    async createRoom(roomData: {
        number: string;
        type: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'FOUR';
        rent: number;
        deposit?: number;
        floor: number;
        amenities?: string[];
    }): Promise<Room> {
        const response = await api.post(this.baseURL, roomData);
        return response.data;
    }

    /**
     * Update room details
    */
    async updateRoom(id: string, roomData: Partial<{
        number: string;
        type: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'FOUR';
        rent: number;
        deposit: number;
        floor: number;
        amenities: string[];
        status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
    }>): Promise<Room> {
        const response = await api.put(`${this.baseURL}/${id}`, roomData);
        return response.data;
    }

    /**
     * Delete a room
     */
    async deleteRoom(id: string): Promise<void> {
        await api.delete(`${this.baseURL}/${id}`);
    }

    /**
     * Get available rooms (with available spots)
     */
    async getAvailableRooms(): Promise<Room[]> {
        const response = await api.get(`${this.baseURL}/available`);
        return response.data;
    }

    /**
     * Assign tenant to room
     */
    async assignTenant(roomId: string, tenantId: string): Promise<RoomAssignmentResponse> {
        const response = await api.post(`${this.baseURL}/${roomId}/assign-tenant`, {
        tenantId
        });
        return response.data;
    }

    /**
     * Release tenant from room
     */
    async releaseTenant(roomId: string, tenantId: string): Promise<RoomAssignmentResponse> {
        const response = await api.delete(`${this.baseURL}/${roomId}/tenants/${tenantId}`);
        return response.data;
    }

    /**
     * Get room occupancy statistics
     */
    async getOccupancyStats(): Promise<OccupancyStats> {
        const response = await api.get(`${this.baseURL}/stats/occupancy`);
        return response.data;
    }

    
  /**
   * Get room type display name and capacity
   */
  getRoomTypeInfo(type: string) {
    const typeMap = {
      SINGLE: { name: 'Single Sharing', capacity: 1, icon: '👤' },
      DOUBLE: { name: 'Double Sharing', capacity: 2, icon: '👥' },
      TRIPLE: { name: 'Triple Sharing', capacity: 3, icon: '👨‍👩‍👧' },
      FOUR: { name: 'Four Sharing', capacity: 4, icon: '👨‍👩‍👧‍👦' },
    };
    
    return typeMap[type as keyof typeof typeMap] || { 
      name: type, 
      capacity: 1, 
      icon: '🏠' 
    };
  }

  /**
   * Get occupancy status color
   */
  getOccupancyColor(currentOccupancy: number, maxOccupancy: number): string {
    const percentage = (currentOccupancy / maxOccupancy) * 100;
    
    if (percentage === 0) return 'text-gray-500';
    if (percentage === 100) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-green-600';
  }

  /**
   * Get room status badge variant
   */
  getStatusBadgeVariant(status: string, isFullyOccupied?: boolean): string {
    switch (status) {
      case 'AVAILABLE':
        return isFullyOccupied ? 'secondary' : 'default';
      case 'OCCUPIED':
        return 'secondary';
      case 'MAINTENANCE':
        return 'destructive';
      default:
        return 'outline';
    }
  }

  /**
   * Format rent amount
   */
  formatRent(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Calculate total monthly revenue for all rooms
   */
  calculateTotalRevenue(rooms: Room[]): number {
    return rooms.reduce((total, room) => {
      return total + (room.rent * room.currentOccupancy);
    }, 0);
  }

}

export const roomService = new RoomService();

