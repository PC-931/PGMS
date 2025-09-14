
import api from './api';
import { Tenant } from '../types';

class TenantService {
  private baseURL = 'admin/tenants';

    async getAllTenants(): Promise<any> {
        const response = await api.get(this.baseURL);
        return response.data;
    }

    async getTenantById(id: string): Promise<any> {
        const response = await api.get(`${this.baseURL}/${id}`);
        return response.data;
    }

    async createTenant(tenantData: any): Promise<any> {
        const response = await api.post(this.baseURL, tenantData);
        return response.data;
    } 

    async updateTenant(id: string, tenantData: any): Promise<any> {
        const response = await api.put(`${this.baseURL}/${id}`, tenantData);
        return response.data;
    }

    async deleteTenant(id: string): Promise<any> {
        const response = await api.delete(`${this.baseURL}/${id}`);
        return response.data;
    }
}

export const tenantService = new TenantService();

