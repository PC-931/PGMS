import { ReportConfig, ReportData } from '../types';
import api from './api';

class ReportService {
  private baseURL = '/admin/reports';

  async generateReport(config: ReportConfig): Promise<{ report: ReportData; message: string }> {
    try {
      const response = await api.post(`${this.baseURL}/generate`, config);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to generate report');
    }
  }

  async getReportData(type: string, period: string): Promise<any> {
    try {
      const response = await api.get(`${this.baseURL}/data/${type}/${period}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch report data');
    }
  }

  async downloadReport(reportId: string): Promise<{ downloadUrl: string }> {
    try {
      const response = await api.get(`${this.baseURL}/download/${reportId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to download report');
    }
  }

  // Helper method to get available rooms for tenant assignment
  async getAvailableRooms(): Promise<any[]> {
    try {
      const response = await api.get('/admin/available-rooms');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch available rooms');
    }
  }

  // Helper method to assign tenant to room
  async assignTenantToRoom(roomId: string, tenantId: string): Promise<any> {
    try {
      const response = await api.patch(`/admin/rooms/${roomId}/assign-tenant`, { tenantId });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to assign tenant to room');
    }
  }
}

export const reportService = new ReportService();