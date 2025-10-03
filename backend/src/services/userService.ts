import { prisma } from './database';
import { User, Role } from '@prisma/client';

export class UserService {
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password from selection
      },
    });
  }

  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: Role;
  }): Promise<User> {
    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error(`User with email ${data.email} already exists`);
    }

    return prisma.user.create({
      data,
    });
  }

  async getAllTenants() {
    return prisma.user.findMany({
      where: { role: Role.TENANT },
      include: {
        rooms: {
          select: {
            id: true,
            number: true,
            type: true,
            floor: true,
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
        { firstName: 'asc' },
        { lastName: 'asc' }
      ],
    });
  }

  /**
   * Get tenants who are not assigned to any room
   */
  async getUnassignedTenants() {
    return prisma.user.findMany({
      where: {
        role: Role.TENANT,
        rooms: {
          none: {}
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ],
    });
  }

   /**
   * Get tenant by ID with room information
   */
  async getTenantWithRooms(id: string) {
    const tenant = await prisma.user.findUnique({
      where: { 
        id,
        role: Role.TENANT 
      },
      include: {
        rooms: {
          select: {
            id: true,
            number: true,
            type: true,
            floor: true,
            rent: true,
            status: true,
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        maintenanceRequests: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    return tenant;
  }

  /**
   * Update tenant information
   */
  async updateTenant(id: string, data: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }>) {
    // If updating email, check for duplicates
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id }
        }
      });

      if (existingUser) {
        throw new Error(`User with email ${data.email} already exists`);
      }
    }

    return prisma.user.update({
      where: { id },
      data,
      include: {
        rooms: {
          select: {
            id: true,
            number: true,
            type: true,
            floor: true,
          },
        },
      },
    });
  }

  /**
   * Delete tenant (only if not assigned to any room)
   */
  async deleteTenant(id: string): Promise<void> {
    const tenant = await prisma.user.findUnique({
      where: { id },
      include: {
        rooms: true,
      },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    if (tenant.role !== Role.TENANT) {
      throw new Error('User is not a tenant');
    }

    if (tenant.rooms.length > 0) {
      throw new Error('Cannot delete tenant who is assigned to rooms');
    }

    await prisma.user.delete({
      where: { id },
    });
  }

  
  /**
   * Get tenant statistics
   */
  async getTenantStats() {
    const totalTenants = await prisma.user.count({
      where: { role: Role.TENANT }
    });

    const assignedTenants = await prisma.user.count({
      where: {
        role: Role.TENANT,
        rooms: {
          some: {}
        }
      }
    });

    const unassignedTenants = totalTenants - assignedTenants;

    return {
      totalTenants,
      assignedTenants,
      unassignedTenants,
      assignmentRate: totalTenants > 0 ? (assignedTenants / totalTenants) * 100 : 0,
    };
  }
}

export const userService = new UserService();