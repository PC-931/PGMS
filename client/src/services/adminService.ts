
import api from './api';
import { DashboardStats, Room } from '../types';
import { roomService } from './roomService';
import { Tenant } from '../types';
import { tenantService } from './tenantService';

class AdminService {
  private baseURL = '/admin'; // since api.ts already has /api

   async getDashboardStats(): Promise<DashboardStats> {

        const response = await api.get<DashboardStats>(`${this.baseURL}/dashboard/stats`);
        return response.data;        
   }
}

export const adminService = new AdminService();

