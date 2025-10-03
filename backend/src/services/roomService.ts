import { prisma } from './database';
import { RoomStatus, Prisma } from '@prisma/client';

// Define room type capacities
const ROOM_TYPE_CAPACITY = {
  SINGLE: 1,
  DOUBLE: 2,
  TRIPLE: 3,
  FOUR: 4,
} as const;

export type RoomType = keyof typeof ROOM_TYPE_CAPACITY;

export interface RoomWithOccupancy {
  id: string;
  number: string;
  type: string;
  rent: number;
  deposit: number;
  status: RoomStatus;
  floor: number;
  amenities: string[];
  tenantId?: string;
  maxOccupancy: number;
  currentOccupancy: number;
  availableSpots: number;
  isFullyOccupied: boolean;
  tenant?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  tenants?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export class RoomService {
  // async getAllRooms() {
  //   return prisma.room.findMany({
  //     include: {
  //       tenant: {
  //         select: {
  //           id: true,
  //           firstName: true,
  //           lastName: true,
  //           email: true,
  //         },
  //       },
  //       _count: {
  //         select: {
  //           payments: true,
  //           maintenanceRequests: true,
  //         },
  //       },
  //     },
  //   });
  // }
  /**
   * Get all rooms with occupancy details
   */
  async getAllRooms(): Promise<RoomWithOccupancy[]> {
    const rooms = await prisma.room.findMany({
      include: {
        tenants: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        _count: {
          select: {
            payments: true,
            maintenanceRequests: true,
          },
        },
      },
      orderBy: [
        { floor: 'asc' },
        { number: 'asc' }
      ],
    });

    return rooms.map(room => this.calculateOccupancy(room));
  }

  // async findRoomById(id: string) {
  //   return prisma.room.findUnique({
  //     where: { id },
  //     include: {
  //       tenant: {
  //         select: {
  //           id: true,
  //           firstName: true,
  //           lastName: true,
  //           email: true,
  //           phone: true,
  //         },
  //       },
  //       payments: {
  //         orderBy: { createdAt: 'desc' },
  //         take: 5,
  //       },
  //       maintenanceRequests: {
  //         orderBy: { createdAt: 'desc' },
  //       },
  //     },
  //   });
  // }
  /**
   * Find room by ID with occupancy details
   */
  async findRoomById(id: string): Promise<RoomWithOccupancy | null> {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        tenants: {
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

    if (!room) return null;

    return this.calculateOccupancy(room);
  }

  // async createRoom(data: {
  //   number: string;
  //   type: string;
  //   rent: number;
  //   deposit: number;
  //   floor: number;
  //   amenities?: string[];
  // }) {
  //   return prisma.room.create({
  //     data: {
  //       ...data,
  //       rent: new Prisma.Decimal(data.rent),
  //       deposit: new Prisma.Decimal(data.deposit),
  //       amenities: data.amenities || [],
  //     },
  //   });
  // }
  /**
   * Create a new room
   */
  async createRoom(data: {
    number: string;
    type: string;
    rent: number;
    deposit: number;
    floor: number;
    amenities?: string[];
  }): Promise<RoomWithOccupancy> {
    // Check if room number already exists
    const existingRoom = await prisma.room.findUnique({
      where: { number: data.number }
    });

    if (existingRoom) {
      throw new Error(`Room with number ${data.number} already exists`);
    }

    const room = await prisma.room.create({
      data: {
        ...data,
        rent: new Prisma.Decimal(data.rent),
        deposit: new Prisma.Decimal(data.deposit),
        amenities: data.amenities || [],
        status: RoomStatus.AVAILABLE,
      },
      include: {
        tenants: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return this.calculateOccupancy(room);
  }


  // async updateRoom(id: string, data: Partial<{
  //   number: string;
  //   type: string;
  //   rent: number;
  //   deposit: number;
  //   status: RoomStatus;
  //   floor: number;
  //   amenities: string[];
  //   tenantId: string | null;
  // }>) {
  //   const updateData: any = { ...data };
    
  //   if (data.rent !== undefined) {
  //     updateData.rent = new Prisma.Decimal(data.rent);
  //   }
  //   if (data.deposit !== undefined) {
  //     updateData.deposit = new Prisma.Decimal(data.deposit);
  //   }

  //   return prisma.room.update({
  //     where: { id },
  //     data: updateData,
  //   });
  // }
  /**
   * Update room details
   */
  async updateRoom(id: string, data: Partial<{
    number: string;
    type: string;
    rent: number;
    deposit: number;
    status: RoomStatus;
    floor: number;
    amenities: string[];
  }>): Promise<RoomWithOccupancy> {
    // If updating room number, check for duplicates
    if (data.number) {
      const existingRoom = await prisma.room.findFirst({
        where: {
          number: data.number,
          NOT: { id }
        }
      });

      if (existingRoom) {
        throw new Error(`Room with number ${data.number} already exists`);
      }
    }

    const updateData: any = { ...data };
    
    if (data.rent !== undefined) {
      updateData.rent = new Prisma.Decimal(data.rent);
    }
    if (data.deposit !== undefined) {
      updateData.deposit = new Prisma.Decimal(data.deposit);
    }

    const room = await prisma.room.update({
      where: { id },
      data: updateData,
      include: {
        tenants: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return this.calculateOccupancy(room);
  }

  // async deleteRoom(id: string) {
  //   return prisma.room.delete({
  //     where: { id },
  //   });
  // }
   /**
   * Delete a room (only if not occupied)
   */
  async deleteRoom(id: string): Promise<void> {
    const room = await this.findRoomById(id);
    
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.currentOccupancy > 0) {
      throw new Error('Cannot delete room with assigned tenants');
    }

    await prisma.room.delete({
      where: { id },
    });
  }

  // async assignTenant(roomId: string, tenantId: string) {
  //   return prisma.room.update({
  //     where: { id: roomId },
  //     data: {
  //       tenantId,
  //       status: RoomStatus.OCCUPIED,
  //     },
  //   });
  // }
  /**
   * Assign a tenant to a room
   */
  async assignTenant(roomId: string, tenantId: string): Promise<RoomWithOccupancy> {
    return await prisma.$transaction(async (tx) => {
      // Get room with current occupancy
      const room = await tx.room.findUnique({
        where: { id: roomId },
        include: {
          tenants: true,
        },
      });

      if (!room) {
        throw new Error('Room not found');
      }

      const maxOccupancy = this.getMaxOccupancy(room.type);
      const currentOccupancy = room.tenants.length;

      if (currentOccupancy >= maxOccupancy) {
        throw new Error(`Room ${room.number} is fully occupied (${currentOccupancy}/${maxOccupancy})`);
      }

      // Check if tenant is already assigned to a room
      const existingAssignment = await tx.user.findUnique({
        where: { id: tenantId },
        include: { rooms: true },
      });

      if (!existingAssignment) {
        throw new Error('Tenant not found');
      }

      if (existingAssignment.rooms.length > 0) {
        throw new Error('Tenant is already assigned to a room');
      }

      // Assign tenant to room
      await tx.user.update({
        where: { id: tenantId },
        data: {
          rooms: {
            connect: { id: roomId }
          }
        },
      });

      // Update room status if it becomes fully occupied
      const newOccupancy = currentOccupancy + 1;
      const newStatus = newOccupancy >= maxOccupancy ? RoomStatus.OCCUPIED : RoomStatus.AVAILABLE;

      const updatedRoom = await tx.room.update({
        where: { id: roomId },
        data: { status: newStatus },
        include: {
          tenants: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      return this.calculateOccupancy(updatedRoom);
    });
  }

  /**
   * Release a tenant from a room
   */
  async releaseTenant(roomId: string, tenantId: string): Promise<RoomWithOccupancy> {
    return await prisma.$transaction(async (tx) => {
      // Verify tenant is assigned to this room
      const tenant = await tx.user.findFirst({
        where: {
          id: tenantId,
          rooms: {
            some: { id: roomId }
          }
        },
        include: { rooms: true },
      });

      if (!tenant) {
        throw new Error('Tenant is not assigned to this room');
      }

      // Remove tenant from room
      await tx.user.update({
        where: { id: tenantId },
        data: {
          rooms: {
            disconnect: { id: roomId }
          }
        },
      });

      // Update room status to available since it now has space
      const updatedRoom = await tx.room.update({
        where: { id: roomId },
        data: { status: RoomStatus.AVAILABLE },
        include: {
          tenants: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      return this.calculateOccupancy(updatedRoom);
    });
  }

  /**
   * Get available rooms with occupancy details
   */
  async getAvailableRooms(): Promise<RoomWithOccupancy[]> {
    const rooms = await prisma.room.findMany({
      where: {
        status: {
          in: [RoomStatus.AVAILABLE, RoomStatus.OCCUPIED]
        }
      },
      include: {
        tenants: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: [
        { floor: 'asc' },
        { number: 'asc' }
      ],
    });

    // Filter rooms that have available spots
    return rooms
      .map(room => this.calculateOccupancy(room))
      .filter(room => !room.isFullyOccupied);
  }

  /**
   * Get room occupancy statistics
   */
  async getRoomOccupancyStats() {
    const rooms = await this.getAllRooms();
    
    const totalRooms = rooms.length;
    const totalCapacity = rooms.reduce((sum, room) => sum + room.maxOccupancy, 0);
    const totalOccupied = rooms.reduce((sum, room) => sum + room.currentOccupancy, 0);
    const availableSpots = totalCapacity - totalOccupied;
    const occupancyRate = totalCapacity > 0 ? (totalOccupied / totalCapacity) * 100 : 0;
    
    const roomsByStatus = {
      available: rooms.filter(r => r.currentOccupancy === 0).length,
      partiallyOccupied: rooms.filter(r => r.currentOccupancy > 0 && !r.isFullyOccupied).length,
      fullyOccupied: rooms.filter(r => r.isFullyOccupied).length,
      maintenance: rooms.filter(r => r.status === RoomStatus.MAINTENANCE).length,
    };

    return {
      totalRooms,
      totalCapacity,
      totalOccupied,
      availableSpots,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      roomsByStatus,
    };
  }

  /**
   * Get maximum occupancy for a room type
   */
  private getMaxOccupancy(roomType: string): number {
    const type = roomType.toUpperCase() as RoomType;
    return ROOM_TYPE_CAPACITY[type] || 1;
  }

  /**
   * Calculate room occupancy details
   */
  private calculateOccupancy(room: any): RoomWithOccupancy {
    const maxOccupancy = this.getMaxOccupancy(room.type);
    const currentOccupancy = room.tenants ? room.tenants.length : (room.tenantId ? 1 : 0);
    const availableSpots = maxOccupancy - currentOccupancy;
    const isFullyOccupied = currentOccupancy >= maxOccupancy;

    return {
      ...room,
      rent: Number(room.rent),
      deposit: Number(room.deposit),
      maxOccupancy,
      currentOccupancy,
      availableSpots,
      isFullyOccupied,
    };
  }
  
}

export const roomService = new RoomService();