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
    return prisma.user.create({
      data,
    });
  }

  async getAllTenants() {
    return prisma.user.findMany({
      where: { role: Role.TENANT },
      include: {
        rooms: true,
        _count: {
          select: {
            payments: true,
            maintenanceRequests: true,
          },
        },
      },
    });
  }
}

export const userService = new UserService();