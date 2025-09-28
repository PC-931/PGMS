import { prisma } from './database';
import { RoomStatus, Prisma } from '@prisma/client';

export class RoomService {
  async getAllRooms() {
    return prisma.room.findMany({
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            payments: true,
            maintenanceRequests: true,
          },
        },
      },
    });
  }

  async findRoomById(id: string) {
    return prisma.room.findUnique({
      where: { id },
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        maintenanceRequests: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async createRoom(data: {
    number: string;
    type: string;
    rent: number;
    deposit: number;
    floor: number;
    amenities?: string[];
  }) {
    return prisma.room.create({
      data: {
        ...data,
        rent: new Prisma.Decimal(data.rent),
        deposit: new Prisma.Decimal(data.deposit),
        amenities: data.amenities || [],
      },
    });
  }

  async updateRoom(id: string, data: Partial<{
    number: string;
    type: string;
    rent: number;
    deposit: number;
    status: RoomStatus;
    floor: number;
    amenities: string[];
    tenantId: string | null;
  }>) {
    const updateData: any = { ...data };
    
    if (data.rent !== undefined) {
      updateData.rent = new Prisma.Decimal(data.rent);
    }
    if (data.deposit !== undefined) {
      updateData.deposit = new Prisma.Decimal(data.deposit);
    }

    return prisma.room.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteRoom(id: string) {
    return prisma.room.delete({
      where: { id },
    });
  }

  async assignTenant(roomId: string, tenantId: string) {
    return prisma.room.update({
      where: { id: roomId },
      data: {
        tenantId,
        status: RoomStatus.OCCUPIED,
      },
    });
  }
}

export const roomService = new RoomService();