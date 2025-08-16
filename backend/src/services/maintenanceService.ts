import { prisma } from './database';
import { Payment, MaintenanceRequest, MaintenanceStatus } from '@prisma/client';

export class MaintenanceService {
  async getMaintenanceByTenant(tenantId: string): Promise<MaintenanceRequest[]> {
    return prisma.maintenanceRequest.findMany({ where: { tenantId } });
  }

  async getAllMaintenance(): Promise<MaintenanceRequest[]> {
    return prisma.maintenanceRequest.findMany();
  }

  async createMaintenanceRequest(data: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceRequest> {
    const newRequest: MaintenanceRequest = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await prisma.maintenanceRequest.create({ data: newRequest });
    return newRequest;
  }

  async getMaintenanceById(id: string) {
    return prisma.maintenanceRequest.findUnique({ where: { id } });
  }
}

export const maintenanceService = new MaintenanceService();