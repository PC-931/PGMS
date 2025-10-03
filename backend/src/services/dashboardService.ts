// src/services/dashboardService.ts
import { prisma } from './database';
import { PaymentStatus, RoomStatus, Role } from '@prisma/client';

export class DashboardService {
  async getAdminStats() {
    const [
      totalRooms,
      occupiedRooms,
      totalTenants,
      totalRevenue,
      pendingPayments,
      recentActivity
    ] = await Promise.all([
      // Total rooms
      prisma.room.count(),
      
      // Occupied rooms
      prisma.room.count({
        where: { status: RoomStatus.OCCUPIED }
      }),
      
      // Total tenants
      prisma.user.count({
        where: { role: Role.TENANT }
      }),
      
      // Total revenue from paid payments
      prisma.payment.aggregate({
        where: { status: PaymentStatus.PAID },
        _sum: { amount: true }
      }),
      
      // Pending payments count
      prisma.payment.count({
        where: { status: PaymentStatus.PENDING }
      }),
      
      // Recent activity (last 10 activities)
      this.getRecentActivity()
    ]);

    return {
      totalRooms,
      occupiedRooms,
      availableRooms: totalRooms - occupiedRooms,
      totalTenants,
      totalRevenue: totalRevenue._sum.amount?.toNumber() || 0,
      pendingPayments,
      occupancyRate: totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0
    };
  }

  async getTenantDashboard(tenantId: string) {
    const [room, payments, maintenanceRequests] = await Promise.all([
      // Tenant's room
      prisma.room.findFirst({
        where: {
          tenants: {
            some: {
              id: tenantId
            }
          }
        },
        include: {
          payments: {
            where: { status: PaymentStatus.PENDING },
            orderBy: { dueDate: 'asc' }
          }
        }
      }),
      
      // Payment history
      prisma.payment.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          room: {
            select: { number: true }
          }
        }
      }),
      
      // Maintenance requests
      prisma.maintenanceRequest.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        include: {
          room: {
            select: { number: true }
          }
        }
      })
    ]);

    const pendingPayments = payments.filter(p => p.status === PaymentStatus.PENDING);
    const paidPayments = payments.filter(p => p.status === PaymentStatus.PAID);

    return {
      room,
      payments: {
        pending: pendingPayments,
        history: paidPayments.slice(0, 5),
        total: payments.length
      },
      maintenance: {
        active: maintenanceRequests.filter(r => r.status !== 'COMPLETED'),
        total: maintenanceRequests.length
      }
    };
  }

  private async getRecentActivity() {
    // Get recent payments
    const recentPayments = await prisma.payment.findMany({
      where: { status: PaymentStatus.PAID },
      orderBy: { paidDate: 'desc' },
      take: 5,
      include: {
        room: { select: { number: true } },
        tenant: { select: { firstName: true, lastName: true } }
      }
    });

    // Get recent maintenance requests
    const recentMaintenance = await prisma.maintenanceRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        room: { select: { number: true } },
        tenant: { select: { firstName: true, lastName: true } }
      }
    });

    // Combine and format activities
    const activities = [
      ...recentPayments.map(payment => ({
        id: payment.id,
        type: 'payment' as const,
        message: `Payment received from ${payment.tenant.firstName} ${payment.tenant.lastName} - Room ${payment.room.number}`,
        timestamp: payment.paidDate || payment.createdAt,
        amount: payment.amount.toNumber()
      })),
      ...recentMaintenance.map(request => ({
        id: request.id,
        type: 'maintenance' as const,
        message: `${request.title} - Room ${request.room.number}`,
        timestamp: request.createdAt
      }))
    ];

    // Sort by timestamp and return latest 10
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }
}

export const dashboardService = new DashboardService();