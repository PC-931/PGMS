// File: backend/src/services/rentService.ts

import { prisma } from './database';
import { RentStatus, Prisma } from '@prisma/client';
import {
  CreateRentDto,
  UpdateRentDto,
  CreateRentPaymentDto,
  RentFilterDto,
  RentWithRelations,
  MonthlySummary,
  RentInvoice
} from '../types/rent.types';

export class RentService {
  /**
   * Get all rents with filters and pagination
   */
  async getAllRents(filters: RentFilterDto) {
    const {
      tenantId,
      roomId,
      status,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 10,
      sortBy = 'dueDate',
      sortOrder = 'desc'
    } = filters;

    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: Prisma.RentWhereInput = {
      isDeleted: false,
      ...(tenantId && { tenantId }),
      ...(roomId && { roomId }),
      ...(status && { status }),
      ...(startDate && endDate && {
        dueDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    // Add search functionality
    if (search) {
      where.OR = [
        { tenant: { firstName: { contains: search, mode: 'insensitive' } } },
        { tenant: { lastName: { contains: search, mode: 'insensitive' } } },
        { tenant: { email: { contains: search, mode: 'insensitive' } } },
        { room: { number: { contains: search, mode: 'insensitive' } } }
      ];
    }

    // Fetch data with pagination
    const [rents, total] = await Promise.all([
      prisma.rent.findMany({
        where,
        include: {
          tenant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          room: {
            select: {
              id: true,
              number: true,
              type: true,
              floor: true
            }
          },
          rentPayments: {
            select: {
              id: true,
              amount: true,
              paidAt: true,
              method: true,
              reference: true,
              notes: true
            },
            orderBy: { paidAt: 'desc' }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      prisma.rent.count({ where })
    ]);

    // Calculate outstanding amount for each rent
    const rentsWithOutstanding = rents.map(rent => ({
      ...rent,
      amount: Number(rent.amount),
      paidAmount: Number(rent.paidAmount),
      outstandingAmount: Number(rent.amount) - Number(rent.paidAmount),
      rentPayments: rent.rentPayments.map(payment => ({
        ...payment,
        amount: Number(payment.amount)
      }))
    }));

    return {
      rents: rentsWithOutstanding,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get rent by ID with full details
   */
  async getRentById(id: string): Promise<RentWithRelations | null> {
    const rent = await prisma.rent.findUnique({
      where: { id, isDeleted: false },
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        room: {
          select: {
            id: true,
            number: true,
            type: true,
            floor: true
          }
        },
        rentPayments: {
          select: {
            id: true,
            amount: true,
            paidAt: true,
            method: true,
            reference: true,
            notes: true
          },
          orderBy: { paidAt: 'desc' }
        }
      }
    });

    if (!rent) return null;

    return {
      ...rent,
      amount: Number(rent.amount),
      paidAmount: Number(rent.paidAmount),
      outstandingAmount: Number(rent.amount) - Number(rent.paidAmount),
      rentPayments: rent.rentPayments.map(payment => ({
        ...payment,
        amount: Number(payment.amount)
      }))
    } as RentWithRelations;
  }

  /**
   * Create a new rent entry
   */
  async createRent(data: CreateRentDto, createdBy: string) {
    const { tenantId, roomId, amount, periodStart, periodEnd, dueDate, notes } = data;

    // Validate tenant exists and is assigned to the room
    const tenant = await prisma.user.findFirst({
      where: {
        id: tenantId,
        role: 'TENANT',
        rooms: { some: { id: roomId } }
      }
    });

    if (!tenant) {
      throw new Error('Tenant not found or not assigned to the specified room');
    }

    // Check for overlapping rent periods
    const overlapping = await prisma.rent.findFirst({
      where: {
        tenantId,
        roomId,
        isDeleted: false,
        OR: [
          {
            periodStart: { lte: new Date(periodEnd) },
            periodEnd: { gte: new Date(periodStart) }
          }
        ]
      }
    });

    if (overlapping) {
      throw new Error('Rent period overlaps with an existing rent entry');
    }

    // Create rent
    const rent = await prisma.rent.create({
      data: {
        tenantId,
        roomId,
        amount: new Prisma.Decimal(amount),
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        dueDate: new Date(dueDate),
        notes,
        createdBy,
        status: 'PENDING'
      },
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        room: {
          select: {
            id: true,
            number: true,
            type: true,
            floor: true
          }
        }
      }
    });

    return {
      ...rent,
      amount: Number(rent.amount),
      paidAmount: Number(rent.paidAmount),
      outstandingAmount: Number(rent.amount) - Number(rent.paidAmount)
    };
  }

  /**
   * Update rent details
   */
  async updateRent(id: string, data: UpdateRentDto) {
    const updateData: any = { ...data };

    if (data.amount !== undefined) {
      updateData.amount = new Prisma.Decimal(data.amount);
    }

    if (data.periodStart) {
      updateData.periodStart = new Date(data.periodStart);
    }

    if (data.periodEnd) {
      updateData.periodEnd = new Date(data.periodEnd);
    }

    if (data.dueDate) {
      updateData.dueDate = new Date(data.dueDate);
    }

    const rent = await prisma.rent.update({
      where: { id },
      data: updateData,
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        room: {
          select: {
            id: true,
            number: true,
            type: true,
            floor: true
          }
        }
      }
    });

    return {
      ...rent,
      amount: Number(rent.amount),
      paidAmount: Number(rent.paidAmount),
      outstandingAmount: Number(rent.amount) - Number(rent.paidAmount)
    };
  }

  /**
   * Soft delete rent
   */
  async deleteRent(id: string) {
    await prisma.rent.update({
      where: { id },
      data: { isDeleted: true }
    });
  }

  /**
   * Add payment to rent
   */
  async addPayment(rentId: string, data: CreateRentPaymentDto, createdBy: string) {
    return await prisma.$transaction(async (tx) => {
      // Get current rent
      const rent = await tx.rent.findUnique({
        where: { id: rentId, isDeleted: false }
      });

      if (!rent) {
        throw new Error('Rent not found');
      }

      const currentPaid = Number(rent.paidAmount);
      const totalAmount = Number(rent.amount);
      const newPaidAmount = currentPaid + data.amount;

      if (newPaidAmount > totalAmount) {
        throw new Error('Payment amount exceeds outstanding balance');
      }

      // Create payment record
      const payment = await tx.rentPayment.create({
        data: {
          rentId,
          amount: new Prisma.Decimal(data.amount),
          paidAt: new Date(data.paidAt),
          method: data.method,
          reference: data.reference,
          notes: data.notes,
          createdBy
        }
      });

      // Update rent status and paid amount
      let newStatus: RentStatus;
      if (newPaidAmount >= totalAmount) {
        newStatus = 'PAID';
      } else if (newPaidAmount > 0) {
        newStatus = 'PARTIAL';
      } else {
        newStatus = rent.status;
      }

      const updatedRent = await tx.rent.update({
        where: { id: rentId },
        data: {
          paidAmount: new Prisma.Decimal(newPaidAmount),
          status: newStatus
        },
        include: {
          tenant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          room: {
            select: {
              id: true,
              number: true,
              type: true
            }
          },
          rentPayments: true
        }
      });

      return {
        payment: {
          ...payment,
          amount: Number(payment.amount)
        },
        rent: {
          ...updatedRent,
          amount: Number(updatedRent.amount),
          paidAmount: Number(updatedRent.paidAmount),
          outstandingAmount: Number(updatedRent.amount) - Number(updatedRent.paidAmount)
        }
      };
    });
  }

  /**
   * Get monthly summary
   */
  async getMonthlySummary(month: number, year: number): Promise<MonthlySummary> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const rents = await prisma.rent.findMany({
      where: {
        isDeleted: false,
        dueDate: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const summary = rents.reduce(
      (acc, rent) => {
        const amount = Number(rent.amount);
        const paidAmount = Number(rent.paidAmount);

        acc.totalExpected += amount;
        acc.totalCollected += paidAmount;
        acc.totalOutstanding += amount - paidAmount;

        if (rent.status === 'PAID') acc.paidCount++;
        else if (rent.status === 'PENDING') acc.pendingCount++;
        else if (rent.status === 'OVERDUE') {
          acc.overdueCount++;
          acc.totalOverdue += amount - paidAmount;
        } else if (rent.status === 'PARTIAL') acc.partialCount++;

        return acc;
      },
      {
        month: startDate.toLocaleString('default', { month: 'long' }),
        year,
        totalExpected: 0,
        totalCollected: 0,
        totalOutstanding: 0,
        totalOverdue: 0,
        paidCount: 0,
        pendingCount: 0,
        overdueCount: 0,
        partialCount: 0
      }
    );

    return summary;
  }

  /**
   * Generate invoice for rent
   */
  async generateInvoice(rentId: string): Promise<RentInvoice> {
    const rent = await this.getRentById(rentId);

    if (!rent) {
      throw new Error('Rent not found');
    }

    const invoiceNumber = `INV-${rent.room.number}-${new Date(rent.periodStart).getFullYear()}-${String(new Date(rent.periodStart).getMonth() + 1).padStart(2, '0')}`;

    return {
      rentId: rent.id,
      invoiceNumber,
      tenant: {
        name: `${rent.tenant.firstName} ${rent.tenant.lastName}`,
        email: rent.tenant.email,
        phone: rent.tenant.phone
      },
      room: {
        number: rent.room.number,
        type: rent.room.type
      },
      period: {
        start: rent.periodStart,
        end: rent.periodEnd
      },
      amount: rent.amount,
      paidAmount: rent.paidAmount,
      outstandingAmount: rent.outstandingAmount,
      dueDate: rent.dueDate,
      status: rent.status,
      payments: rent.rentPayments.map(p => ({
        date: p.paidAt,
        amount: p.amount,
        method: p.method,
        reference: p.reference
      })),
      generatedAt: new Date()
    };
  }

  /**
   * Update overdue rents (to be called by cron job)
   */
  async updateOverdueRents() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await prisma.rent.updateMany({
      where: {
        isDeleted: false,
        status: { in: ['PENDING', 'PARTIAL'] },
        dueDate: { lt: today }
      },
      data: {
        status: 'OVERDUE'
      }
    });

    return result.count;
  }
}

export const rentService = new RentService();